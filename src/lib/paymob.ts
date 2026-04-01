import crypto from 'crypto';

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

/**
 * Step 1: Authentication
 * Gets an authentication token from Paymob using the API key.
 */
export async function authenticate() {
    const apiKey = process.env.PAYMOB_API_KEY;
    if (!apiKey) throw new Error("PAYMOB_API_KEY is not defined");

    const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Paymob Auth Error:", err);
        throw new Error("Failed to authenticate with Paymob");
    }

    const data = await response.json();
    return data.token;
}

/**
 * Step 2: Order Registration
 * Registers the order in Paymob's system.
 */
export async function registerOrder(token: string, amountCents: number, merchantOrderId: string) {
    const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_token: token,
            delivery_needed: "false",
            amount_cents: Math.round(amountCents),
            currency: "EGP",
            merchant_order_id: merchantOrderId, // our internal order ID
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Paymob Order Registration Error:", err);
        throw new Error("Failed to register order with Paymob");
    }

    const data = await response.json();
    return data.id; // Paymob Order ID
}

/**
 * Step 3: Payment Key Generation
 * Generates a payment key for a specific integration (Card, Wallet, etc.)
 */
export async function getPaymentKey(params: {
    token: string;
    amountCents: number;
    paymobOrderId: string;
    billingData: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        apartment?: string;
        floor?: string;
        street: string;
        building?: string;
        shipping_method?: string;
        postal_code?: string;
        city: string;
        country: string;
        state: string;
    };
    integrationId: string;
}) {
    const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_token: params.token,
            amount_cents: Math.round(params.amountCents),
            expiration: 3600, // 1 hour
            order_id: params.paymobOrderId,
            billing_data: params.billingData,
            currency: "EGP",
            integration_id: params.integrationId,
            lock_order_when_paid: "true"
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Paymob Payment Key Error:", err);
        throw new Error("Failed to generate payment key from Paymob");
    }

    const data = await response.json();
    return data.token; // Payment Key
}

/**
 * HMAC Verification
 * Verifies the integrity of Paymob's callback data.
 */
type PaymobSourceData = {
    pan?: string;
    sub_type?: string;
    type?: string;
};

type PaymobOrderRef = {
    id?: string | number;
};

type PaymobCallbackObj = {
    amount_cents?: string | number;
    created_at?: string;
    currency?: string;
    error_occured?: boolean;
    has_parent_transaction?: boolean;
    id?: string | number;
    integration_id?: string | number;
    is_3d_secure?: boolean;
    is_auth?: boolean;
    is_capture?: boolean;
    is_refunded?: boolean;
    is_standalone_payment?: boolean;
    is_voided?: boolean;
    order?: PaymobOrderRef;
    owner?: string | number;
    pending?: boolean;
    source_data?: PaymobSourceData;
    success?: boolean;
};

export function verifyHMAC(obj: PaymobCallbackObj, hmac: string) {
    const secret = process.env.PAYMOB_HMAC_SECRET;
    if (!secret) throw new Error("PAYMOB_HMAC_SECRET is not defined");

    // Paymob HMAC verification logic
    // Fields must be in a specific order: 
    // amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id, owner, pending, source_data.pan, source_data.sub_type, source_data.type, success
    
    // Note: These fields are usually sent in the GET/POST request
    // For POST (Transaction Processed), Paymob sends a nested object.
    
    // This is a simplified version; real HMAC verification requires concatenating fields in alphabetical OR specific sequence.
    // According to Paymob docs: concatenation of all transaction object values in specific order.
    
    const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order,
        owner,
        pending,
        source_data,
        success
    } = obj;

    const sequence = [
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order.id,
        owner,
        pending,
        source_data.pan,
        source_data.sub_type,
        source_data.type,
        success
    ].join('');

    const calculatedHmac = crypto
        .createHmac('sha512', secret)
        .update(sequence)
        .digest('hex');

    return calculatedHmac === hmac;
}
