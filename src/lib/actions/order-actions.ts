"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  orders,
  orderItems,
  products,
  users,
  discountCodes,
  generateId,
} from "@/lib/db";
import { eq, and, gte, lte, desc, asc, count, lt, sql } from "drizzle-orm";
import { generateReceiptQR, type OrderWithItems } from "@/lib/printer/qr-receipt";
import { getPrinterService } from "@/lib/printer/xprinter";

async function getAuth() {
  const m = await import("@/lib/auth");
  return m.auth;
}

async function requireAdmin() {
  const auth = await getAuth();
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireUser() {
  const auth = await getAuth();
  const session = await auth();
  if (!session?.user) {
    throw new Error("You must be logged in to complete this action");
  }
  return session;
}

export async function getOrders(options?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const { status, startDate, endDate } = options || {};

    const conditions = [];
    if (status && status !== "ALL") {
      conditions.push(eq(orders.status, status));
    }
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) conditions.push(gte(orders.createdAt, d));
    }
    if (endDate) {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        conditions.push(lte(orders.createdAt, d));
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    return await db.query.orders.findMany({
      where: whereCondition,
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
  } catch (error) {
    console.warn("[ZAD][db] Failed to fetch orders (database unavailable):", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getOrderById(id: string) {
  try {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn(`[ZAD][db] Failed to fetch order ${id}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();

  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
    },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const isCancelling = status === "CANCELLED" && existingOrder.status !== "CANCELLED";

  await db.transaction(async (tx) => {
    if (isCancelling) {
      for (const item of existingOrder.items) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId),
        });

        if (!product) continue;

        let nextSizes = product.sizes;
        try {
          const parsed = JSON.parse(product.sizes || "[]");
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
            nextSizes = JSON.stringify(
              (parsed as Array<{ name?: string; stock?: number }>).map((s) => {
                if (s.name === item.size) {
                  return { ...s, stock: (s.stock || 0) + item.quantity };
                }
                return s;
              })
            );
          }
        } catch {
          nextSizes = product.sizes;
        }

        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            sizes: nextSizes,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    await tx
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  await db.delete(orderItems).where(eq(orderItems.orderId, id));
  await db.delete(orders).where(eq(orders.id, id));
  return { success: true };
}

export async function getDashboardStats(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const { startDate, endDate } = options || {};
  await requireAdmin();

  const conditions = [];
  if (startDate) {
    const d = new Date(startDate);
    if (!isNaN(d.getTime())) conditions.push(gte(orders.createdAt, d));
  }
  if (endDate) {
    const d = new Date(endDate);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      conditions.push(lte(orders.createdAt, d));
    }
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const [totalProductsRes] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.active, true));

    const totalProducts = totalProductsRes?.value ?? 0;

    const allOrders = await db.query.orders.findMany({
      where: whereCondition,
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            product: {
              columns: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const lowStockProducts = await db.query.products.findMany({
      where: and(eq(products.active, true), lt(products.stock, 5)),
      columns: {
        id: true,
        name: true,
        stock: true,
      },
      orderBy: [asc(products.stock)],
    });

    let totalRevenue = 0;
    const statusMap = new Map<string, number>();
    const productMap = new Map<
      string,
      { id: string; name: string; quantity: number; price: number }
    >();
    const clientMap = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        totalSpent: number;
        orderCount: number;
        lastOrder: Date;
      }
    >();
    const dailyRevenueMap = new Map<
      string,
      { date: string; revenue: number; orders: number }
    >();

    allOrders.forEach((order) => {
      totalRevenue += order.total;
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);

      const client = clientMap.get(order.customerEmail);
      if (client) {
        client.totalSpent += order.total;
        client.orderCount += 1;
        if (order.createdAt > client.lastOrder) client.lastOrder = order.createdAt;
      } else {
        clientMap.set(order.customerEmail, {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          totalSpent: order.total,
          orderCount: 1,
          lastOrder: order.createdAt,
        });
      }

      const dayKey = order.createdAt.toISOString().split("T")[0];
      const daily = dailyRevenueMap.get(dayKey);
      if (daily) {
        daily.revenue += order.total;
        daily.orders += 1;
      } else {
        dailyRevenueMap.set(dayKey, {
          date: dayKey,
          revenue: order.total,
          orders: 1,
        });
      }

      order.items.forEach((item) => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productMap.set(item.productId, {
            id: item.productId,
            name: item.product?.name ?? item.productId,
            quantity: item.quantity,
            price: item.price,
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 50);

    const clientStats = Array.from(clientMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    const dailyStats = Array.from(dailyRevenueMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    const ordersByStatus = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        count,
      })
    );

    return {
      totalProducts,
      totalOrders: allOrders.length,
      totalRevenue,
      totalCustomers: clientMap.size,
      recentOrders: allOrders.slice(0, 5),
      ordersByStatus,
      topProducts,
      clientStats,
      dailyStats,
      lowStockProducts,
      allOrders,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error(
      "Unable to generate report data. Please check your data or try again."
    );
  }
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  total: number;
  discountCode?: string;
  shippingFee?: number;
  paymentMethod?: string;
}) {
  const session = await requireUser();

  const newOrderId = generateId();

  await db.transaction(async (tx) => {
    let discountPct = 0;
    if (data.discountCode) {
      const dc = await tx.query.discountCodes.findFirst({
        where: eq(discountCodes.code, data.discountCode),
      });

      if (!dc) throw new Error("Invalid discount code");
      if (dc.expiresAt && dc.expiresAt < new Date())
        throw new Error("Discount code has expired");
      if (dc.usedCount >= dc.usesPerCode)
        throw new Error("Discount code has no uses remaining");

      discountPct = dc.discountPct;
      await tx
        .update(discountCodes)
        .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
        .where(eq(discountCodes.code, data.discountCode));
    }

    const finalTotal = data.total * (1 - discountPct / 100) + (data.shippingFee || 0);

    const userExists = session.user?.id
      ? await tx.query.users.findFirst({ where: eq(users.id, session.user.id) })
      : null;

    const isOnline = data.paymentMethod && data.paymentMethod !== "COD";
    const initialStatus = isOnline ? "PENDING_PAYMENT" : "PENDING";

    await tx.insert(orders).values({
      id: newOrderId,
      userId: userExists ? userExists.id : null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      notes: data.notes,
      total: finalTotal,
      discountCode: data.discountCode || null,
      discountPct,
      shippingFee: data.shippingFee || 0,
      status: initialStatus,
      paymentMethod: data.paymentMethod || "COD",
      paymentStatus: "UNPAID",
    });

    for (const item of data.items) {
      await tx.insert(orderItems).values({
        orderId: newOrderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size || null,
        color: item.color || null,
      });

      const product = await tx.query.products.findFirst({
        where: eq(products.id, item.productId),
      });

      if (product) {
        let sizes: unknown[] = [];
        try {
          const parsed = JSON.parse(product.sizes || "[]");
          sizes = Array.isArray(parsed) ? parsed : [];
        } catch {
          sizes = [];
        }

        if (sizes.length > 0 && typeof sizes[0] === "object") {
          sizes = (sizes as Array<{ name?: string; stock?: number }>).map((s) => {
            if (s?.name === item.size) {
              return { ...s, stock: Math.max(0, (s.stock || 0) - item.quantity) };
            }
            return s;
          });
        }

        await tx
          .update(products)
          .set({
            stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
            sizes: JSON.stringify(sizes),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }
  });

  const createdOrder = await db.query.orders.findFirst({
    where: eq(orders.id, newOrderId),
    with: {
      items: true,
    },
  });

  if (!createdOrder) {
    throw new Error("Failed to create order");
  }

  // Auto-print receipt in background for COD
  if ((createdOrder.paymentMethod || "COD") === "COD" && process.env.VERCEL !== "1") {
    void printOrderReceipt(createdOrder.id).catch((error) => {
      console.error(`Auto-print failed for order ${createdOrder.id}:`, error);
    });
  }

  return createdOrder;
}

export async function printOrderReceipt(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: {
              columns: { name: true },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`Order ${orderId} not found`);
      return { success: false, error: "Order not found" };
    }

    const qrCode = await generateReceiptQR(order as unknown as OrderWithItems);

    const receiptData = {
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleString("ar-EG"),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: `${order.address}, ${order.city}`,
      items: order.items.map((item) => ({
        name: item.product?.name ?? item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size ?? undefined,
        color: item.color ?? undefined,
      })),
      subtotal: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      discountAmount:
        order.discountPct > 0
          ? (order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) *
              order.discountPct) /
            100
          : 0,
      discountPct: order.discountPct,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod:
        order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment",
      qrCode,
    };

    const printerService = await getPrinterService();
    if (printerService) {
      const printed = await printerService.printReceipt(receiptData);
      return { success: printed, error: printed ? undefined : "Print failed" };
    } else {
      console.warn("⚠️ Printer service not available");
      return { success: true, warning: "Printer not available" };
    }
  } catch (error) {
    console.error("Error printing receipt:", error);
    return { success: false, error: String(error) };
  }
}
