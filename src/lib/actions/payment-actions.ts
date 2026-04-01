"use server";

import * as paymob from "@/lib/paymob";
import { getOrderById } from "./order-actions";

/**
 * Initiates a Paymob payment and returns the checkout URL.
 */
export async function initiatePaymobPayment(orderId: string, method: 'CARD' | 'WALLET' | 'VALU') {
    try {
        const order = await getOrderById(orderId);
        if (!order) throw new Error("Order not found");

        const amountCents = order.total * 100;

        // Step 1: Auth
        const token = await paymob.authenticate();

        // Step 2: Register Order
        const paymobOrderId = await paymob.registerOrder(token, amountCents, order.id);

        // Step 3: Get Payment Key
        // Map our internal method to Paymob's Integration ID
        let integrationId = "";
        if (method === 'CARD') integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID || "";
        if (method === 'WALLET') integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID || "";
        if (method === 'VALU') integrationId = process.env.PAYMOB_VALU_INTEGRATION_ID || "";

        if (!integrationId) throw new Error(`Integration ID for ${method} is not configured`);

        // Billing Data (Paymob requires specific fields)
        // Note: Paymob doesn't accept empty values for some mandatory fields
        const billingData = {
            first_name: order.customerName.split(' ')[0] || "Customer",
            last_name: order.customerName.split(' ').slice(1).join(' ') || "ZiadZad",
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

        // Step 4: Return Redirect URL
        if (method === 'CARD') {
            const iframeId = process.env.PAYMOB_IFRAME_ID;
            return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
        } else if (method === 'WALLET') {
            // Mobile Wallets often need their own redirection logic 
            // but the payment key is still used to trigger the final redirection by the client or server.
            // For simple implementation, we can return a Paymob URL that handles the wallet redirect.
            return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
            // (Note: Some wallet flows require a different endpoint, but the iframe URL often works as a fallback)
        } else if (method === 'VALU') {
             return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
        }

        throw new Error("Invalid payment method");
    } catch (error) {
        console.error("Paymob Initialization Error:", error);
        throw error;
    }
}
