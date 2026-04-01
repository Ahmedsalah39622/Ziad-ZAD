import { NextRequest, NextResponse } from 'next/server';
import { verifyHMAC } from '@/lib/paymob';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * GET: Transaction Response (User Redirect)
 * Paymob redirects the user here after payment.
 * URL: /api/paymob/callback?success=true&id=123...
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success') === 'true';
    const merchantOrderId = searchParams.get('merchant_order_id'); // This is our internal Order ID
    const paymobTransactionId = searchParams.get('id');

    // Paymob sends many other params for HMAC verification in GET too
    // But usually for the redirect, we just want to know if it succeeded and where to go.
    // For security, We SHOULD verify HMAC here too, but the POST webhook is more reliable for DB updates.

    if (success && merchantOrderId) {
        return NextResponse.redirect(new URL(`/checkout/status?status=success&orderId=${merchantOrderId}&txnId=${paymobTransactionId}`, req.url));
    } else {
        return NextResponse.redirect(new URL(`/checkout/status?status=failed&orderId=${merchantOrderId}`, req.url));
    }
}

/**
 * POST: Transaction Processed (Webhook)
 * Paymob sends a POST request here when the transaction is processed.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { obj } = body;
        const hmac = req.nextUrl.searchParams.get('hmac') || body?.hmac;

        if (!obj || !hmac) {
            return NextResponse.json({ error: "Missing HMAC" }, { status: 400 });
        }

        // Verify HMAC
        const isValid = verifyHMAC(obj, hmac);
        if (!isValid) {
            console.error("Invalid Paymob HMAC Signature");
            return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
        }

        const success = obj.success;
        const merchantOrderId = obj?.order?.merchant_order_id as string | undefined; // Our internal Order ID
        const paymobTransactionId = obj?.id;

        if (!merchantOrderId) {
            return NextResponse.json({ error: "Missing merchant_order_id" }, { status: 400 });
        }

        if (success) {
            // Update Order in DB
            await prisma.order.update({
                where: { id: merchantOrderId },
                data: {
                    paymentStatus: "PAID",
                    status: "PENDING", // Move from PENDING_PAYMENT back to PENDING for fulfillment
                }
            });
            console.log(`Order ${merchantOrderId} marked as PAID via Paymob.`);
        } else {
            // Mark as failed if needed, or leave as PENDING_PAYMENT
            await prisma.order.update({
                where: { id: merchantOrderId },
                data: {
                    paymentStatus: "FAILED",
                    // We don't necessarily cancel the order yet, let the user retry
                }
            });
            console.log(`Order ${merchantOrderId} payment FAILED via Paymob.`);
        }

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${merchantOrderId}`);

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Paymob Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
