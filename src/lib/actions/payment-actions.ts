"use server";

import * as paymob from "@/lib/paymob";
import { getOrderById } from "./order-actions";

/**
 * Initiates a Paymob payment and returns the checkout URL.
 */
type PaymobInitResult = {
    checkoutUrl?: string;
    error?: string;
};

export async function initiatePaymobPayment(orderId: string, method: 'CARD' | 'WALLET' | 'VALU'): Promise<PaymobInitResult> {
    try {
        const order = await getOrderById(orderId);
        if (!order) {
            return { error: "Order not found. Please try again or contact support." };
        }

        const amountCents = Math.round(order.total * 100);

        // Step 1: Auth
        const token = await paymob.authenticate();

        // Step 2: Register Order
        const paymobOrderId = await paymob.registerOrder(token, amountCents, order.id);

        // Step 3: Get Payment Key
        let integrationId = "";
        if (method === 'CARD') integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID || "";
        if (method === 'WALLET') integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID || "";
        if (method === 'VALU') integrationId = process.env.PAYMOB_VALU_INTEGRATION_ID || "";

        if (!integrationId) {
            console.error(`Missing integration id for ${method}`);
            return { error: `Payment method ${method} is not enabled on this store. Please select a different method or contact support.` };
        }

        const iframeId = process.env.PAYMOB_IFRAME_ID;
        if (!iframeId) {
            console.error("Missing PAYMOB_IFRAME_ID");
            return { error: "Online payment is currently unavailable (integration not configured). Please try again later." };
        }

        const customerName = (order.customerName || "").trim();
        const splitName = customerName ? customerName.split(' ') : ["Customer"];
        const billingData = {
            first_name: splitName[0] || "Customer",
            last_name: splitName.slice(1).join(' ') || "ZiadZad",
            email: order.customerEmail || "customer@ziadzad.com",
            phone_number: order.customerPhone || "01234567890",
            apartment: "NA",
            floor: "NA",
            street: order.address || "NA",
            building: "NA",
            shipping_method: "PKG",
            postal_code: "NA",
            city: order.city || "Cairo",
            country: "EGY",
            state: order.city || "Cairo",
        };

        const paymentKey = await paymob.getPaymentKey({
            token,
            amountCents,
            paymobOrderId,
            billingData,
            integrationId
        });

        const checkoutUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
        return { checkoutUrl };
    } catch (error) {
        console.error("Paymob Initialization Error:", error);
        return {
            error: "We couldn\'t initialize the online payment service. Please try again later or contact support."
        };
    }
}

