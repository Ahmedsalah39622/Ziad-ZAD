import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings, orders, orderItems, products } from "@/lib/db";
import { eq, and, notInArray, asc, inArray } from "drizzle-orm";

const PRINTED_IDS_KEY = "print_agent_printed_order_ids";

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PRINT_AGENT_SECRET;
  if (!expected) return false;

  const provided = req.headers.get("x-print-agent-secret") || "";
  return provided === expected;
}

async function getPrintedIds(): Promise<string[]> {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, PRINTED_IDS_KEY),
    columns: { value: true },
  });

  if (!setting?.value) return [];

  try {
    const parsed = JSON.parse(setting.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const printedIds = await getPrintedIds();

    const whereCondition =
      printedIds.length > 0
        ? and(eq(orders.paymentMethod, "COD"), notInArray(orders.id, printedIds))
        : eq(orders.paymentMethod, "COD");

    const pendingOrders = await db
      .select()
      .from(orders)
      .where(whereCondition)
      .orderBy(asc(orders.createdAt))
      .limit(10);

    if (!pendingOrders.length) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = pendingOrders.map((o) => o.id);
    const itemRows = await db
      .select({
        item: orderItems,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<
      string,
      Array<{
        name: string;
        quantity: number;
        price: number;
        size: string | null;
        color: string | null;
      }>
    >();

    for (const r of itemRows) {
      const arr = itemsByOrder.get(r.item.orderId) || [];
      arr.push({
        name: r.productName ?? r.item.productId,
        quantity: r.item.quantity,
        price: r.item.price,
        size: r.item.size,
        color: r.item.color,
      });
      itemsByOrder.set(r.item.orderId, arr);
    }

    const payload = pendingOrders.map((order) => {
      const items = itemsByOrder.get(order.id) || [];
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const discountAmount =
        order.discountPct > 0 ? (subtotal * order.discountPct) / 100 : 0;

      return {
        id: order.id,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        city: order.city,
        notes: order.notes,
        status: order.status,
        paymentMethod: order.paymentMethod,
        subtotal,
        discountPct: order.discountPct,
        discountAmount,
        shippingFee: order.shippingFee,
        total: order.total,
        items,
      };
    });

    return NextResponse.json({ orders: payload });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch pending print orders",
        details: error instanceof Error ? error.message : "internal error",
      },
      { status: 500 }
    );
  }
}
