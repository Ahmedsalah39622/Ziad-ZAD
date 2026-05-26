"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { generateReceiptQR } from "@/lib/printer/qr-receipt";
import { getPrinterService } from "@/lib/printer/xprinter";

// Lazy imports to keep server logic out of client bundles
async function getPrisma() {
    const m = await import("@/lib/prisma");
    return m.prisma;
}

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

export async function getOrders(options?: { status?: string; startDate?: Date; endDate?: Date }) {
    const { status, startDate, endDate } = options || {};
    const where: Prisma.OrderWhereInput = {};
    if (status && status !== "ALL") where.status = status;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            const d = new Date(startDate);
            if (!isNaN(d.getTime())) where.createdAt.gte = d;
        }
        if (endDate) {
            const d = new Date(endDate);
            if (!isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                where.createdAt.lte = d;
            }
        }
    }
    const prisma = await getPrisma();
    return prisma.order.findMany({
        where,
        include: {
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getOrderById(id: string) {
    const prisma = await getPrisma();
    return prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: true },
            },
        },
    });
}

export async function updateOrderStatus(id: string, status: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    const result = await prisma.$transaction(async (tx) => {
        const existingOrder = await tx.order.findUnique({
            where: { id },
            include: {
                items: {
                    select: {
                        productId: true,
                        quantity: true,
                        size: true,
                    },
                },
            },
        });

        if (!existingOrder) {
            throw new Error("Order not found");
        }

        const isCancelling = status === "CANCELLED" && existingOrder.status !== "CANCELLED";

        if (isCancelling) {
            for (const item of existingOrder.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { sizes: true },
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

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                        sizes: nextSizes,
                    },
                });
            }
        }

        return tx.order.update({
            where: { id },
            data: { status },
        });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/shop");
    revalidatePath("/");
    return result;
}

export async function deleteOrder(id: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.order.delete({ where: { id } });
}

export async function getDashboardStats(options?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options || {};
    await requireAdmin();

    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            const d = new Date(startDate);
            if (!isNaN(d.getTime())) where.createdAt.gte = d;
        }
        if (endDate) {
            const d = new Date(endDate);
            if (!isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                where.createdAt.lte = d;
            }
        }
    }

    const prisma = await getPrisma();

    try {
        // Fetch only the essentials: Product count and the main Order data
        const [totalProducts, allOrders, lowStockProducts] = await Promise.all([
            prisma.product.count({ where: { active: true } }),
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    total: true,
                    status: true,
                    customerName: true,
                    customerEmail: true,
                    customerPhone: true,
                    createdAt: true,
                    items: {
                        select: {
                            productId: true,
                            quantity: true,
                            price: true,
                            product: {
                                select: {
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.product.findMany({
                where: {
                    active: true,
                    stock: { lt: 5 }
                },
                select: {
                    id: true,
                    name: true,
                    stock: true
                },
                orderBy: { stock: "asc" }
            })
        ]);

        // Aggregate everything in a single JS pass
        let totalRevenue = 0;
        const statusMap = new Map<string, number>();
        const productMap = new Map<string, { id: string; name: string; quantity: number; price: number }>();
        const clientMap = new Map<string, { name: string; email: string; phone: string; totalSpent: number; orderCount: number; lastOrder: Date }>();
        const dailyRevenueMap = new Map<string, { date: string; revenue: number; orders: number }>();

        allOrders.forEach(order => {
            // Basic counters
            totalRevenue += order.total;
            statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);

            // Client aggregation
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
                    lastOrder: order.createdAt
                });
            }

            // Daily aggregation
            const dayKey = order.createdAt.toISOString().split('T')[0];
            const daily = dailyRevenueMap.get(dayKey);
            if (daily) {
                daily.revenue += order.total;
                daily.orders += 1;
            } else {
                dailyRevenueMap.set(dayKey, {
                    date: dayKey,
                    revenue: order.total,
                    orders: 1
                });
            }

            // Product aggregation
            order.items.forEach(item => {
                const existing = productMap.get(item.productId);
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    productMap.set(item.productId, {
                        id: item.productId,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price
                    });
                }
            });
        });

        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 50);

        const clientStats = Array.from(clientMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent);

        const dailyStats = Array.from(dailyRevenueMap.values())
            .sort((a, b) => b.date.localeCompare(a.date));

        const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
            status,
            count
        }));

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
            allOrders // Exposed to avoid redundant fetch on the page
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Unable to generate report data. Please check your data or try again.");
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
    const prisma = await getPrisma();

    const createdOrder = await prisma.$transaction(async (tx) => {
        let discountPct = 0;
        if (data.discountCode) {
            const dc = await tx.discountCode.findUnique({ where: { code: data.discountCode } });
            if (!dc) throw new Error("Invalid discount code");
            if (dc.expiresAt && dc.expiresAt < new Date()) throw new Error("Discount code has expired");
            if (dc.usedCount >= dc.usesPerCode) throw new Error("Discount code has no uses remaining");
            discountPct = dc.discountPct;
            await tx.discountCode.update({
                where: { code: data.discountCode },
                data: { usedCount: { increment: 1 } },
            });
        }

        const finalTotal = (data.total * (1 - discountPct / 100)) + (data.shippingFee || 0);
        
        // Define initial status based on payment method
        const isOnline = data.paymentMethod && data.paymentMethod !== "COD";
        const initialStatus = isOnline ? "PENDING_PAYMENT" : "PENDING";

        const order = await tx.order.create({
            data: {
                user: session.user?.id ? { connect: { id: session.user.id } } : undefined,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                address: data.address,
                city: data.city,
                notes: data.notes,
                total: finalTotal,
                discountCode: data.discountCode,
                discountPct,
                shippingFee: data.shippingFee || 0,
                status: initialStatus,
                paymentMethod: data.paymentMethod || "COD",
                paymentStatus: "UNPAID",
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                        color: item.color,
                    })),
                },
            },
        });

        // Update stock
        for (const item of data.items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
                select: { sizes: true, name: true }
            });

            if (product) {
                let sizes: unknown[] = [];
                try {
                    const parsed = JSON.parse(product.sizes || "[]");
                    sizes = Array.isArray(parsed) ? parsed : [];
                } catch {
                    sizes = [];
                }
                
                if (sizes.length > 0 && typeof sizes[0] === 'object') {
                    // Modern format: [{name, stock}]
                    sizes = (sizes as Array<{ name?: string; stock?: number }>).map((s) => {
                        if (s?.name === item.size) {
                            return { ...s, stock: Math.max(0, (s.stock || 0) - item.quantity) };
                        }
                        return s;
                    });
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                        sizes: JSON.stringify(sizes)
                    },
                });
            }
        }

        return order;
    });

    // Auto-print in the background for COD orders without blocking checkout success.
    // Only attempt direct printing if not running on Vercel (Vercel is serverless and doesn't have a local printer).
    if ((createdOrder.paymentMethod || "COD") === "COD" && process.env.VERCEL !== "1") {
        void printOrderReceipt(createdOrder.id).catch((error) => {
            console.error(`Auto-print failed for order ${createdOrder.id}:`, error);
        });
    }

    return createdOrder;
}

// Helper function to print receipt after order creation
export async function printOrderReceipt(orderId: string) {
    try {
        const prisma = await getPrisma();
        
        // Fetch complete order with items and product details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            console.error(`Order ${orderId} not found`);
            return { success: false, error: "Order not found" };
        }

        // Generate QR code
        const qrCode = await generateReceiptQR(order);

        // Format receipt data with product names
        const receiptData = {
            orderId: order.id,
            date: new Date(order.createdAt).toLocaleString("ar-EG"),
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            address: `${order.address}, ${order.city}`,
            items: order.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                size: item.size ?? undefined,
                color: item.color ?? undefined,
            })),
            subtotal: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            discountAmount: order.discountPct > 0 
                ? (order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * order.discountPct) / 100 
                : 0,
            discountPct: order.discountPct,
            shippingFee: order.shippingFee,
            total: order.total,
            paymentMethod: order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment",
            qrCode,
        };

        // Get printer service and print
        const printerService = await getPrinterService();
        if (printerService) {
            const printed = await printerService.printReceipt(receiptData);
            return { success: printed, error: printed ? undefined : "Print failed" };
        } else {
            console.warn("⚠️ Printer service not available - order created but not printed");
            return { success: true, warning: "Printer not available" };
        }
    } catch (error) {
        console.error("Error printing receipt:", error);
        return { success: false, error: String(error) };
    }
}
