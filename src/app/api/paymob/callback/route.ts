import { NextRequest, NextResponse } from "next/server";
import { verifyHMAC } from "@/lib/paymob";
import { db, orders } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const success = searchParams.get("success") === "true";
  const merchantOrderId = searchParams.get("merchant_order_id");
  const paymobTransactionId = searchParams.get("id");

  if (success && merchantOrderId) {
    return NextResponse.redirect(
      new URL(
        `/checkout/status?status=success&orderId=${merchantOrderId}&txnId=${paymobTransactionId}`,
        req.url
      )
    );
  } else {
    return NextResponse.redirect(
      new URL(`/checkout/status?status=failed&orderId=${merchantOrderId}`, req.url)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { obj } = body;
    const hmac = req.nextUrl.searchParams.get("hmac") || body?.hmac;

    if (!obj || !hmac) {
      return NextResponse.json({ error: "Missing HMAC" }, { status: 400 });
    }

    const isValid = verifyHMAC(obj, hmac);
    if (!isValid) {
      console.error("Invalid Paymob HMAC Signature");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    const success = obj.success;
    const merchantOrderId = obj?.order?.merchant_order_id as string | undefined;
    if (!merchantOrderId) {
      return NextResponse.json(
        { error: "Missing merchant_order_id" },
        { status: 400 }
      );
    }

    if (success) {
      await db
        .update(orders)
        .set({
          paymentStatus: "PAID",
          status: "PENDING",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, merchantOrderId));
      console.log(`Order ${merchantOrderId} marked as PAID via Paymob.`);
    } else {
      await db
        .update(orders)
        .set({
          paymentStatus: "FAILED",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, merchantOrderId));
      console.log(`Order ${merchantOrderId} payment FAILED via Paymob.`);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${merchantOrderId}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paymob Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
