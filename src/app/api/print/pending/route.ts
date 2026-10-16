import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings, orders } from "@/lib/db";
import { eq, and, notInArray, asc } from "drizzle-orm";

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

    const pendingOrders = await db.query.orders.findMany({
      where: whereCondition,
      with: {
        items: {
          with: {
            product: {
              columns: { name: true },
            },
          },
        },
      },
      orderBy: [asc(orders.createdAt)],
      limit: 10,
    });

    const payload = pendingOrders.map((order) => {
      const subtotal = order.items.reduce(
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
        items: order.items.map((item) => ({
          name: item.product?.name ?? item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
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
