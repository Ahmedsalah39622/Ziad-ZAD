import "dotenv/config";
import { getPrinterService } from "./src/lib/printer/xprinter";

type PendingOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    size?: string | null;
    color?: string | null;
  }[];
};

const BASE_URL = process.env.PRINT_AGENT_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;
const SECRET = process.env.PRINT_AGENT_SECRET;
const POLL_MS = Number(process.env.PRINT_AGENT_POLL_MS || 5000);

if (!BASE_URL) {
  console.error("Missing PRINT_AGENT_SERVER_URL or NEXT_PUBLIC_APP_URL");
  process.exit(1);
}

if (!SECRET) {
  console.error("Missing PRINT_AGENT_SECRET");
  process.exit(1);
}

const AGENT_SECRET = SECRET as string;

async function fetchPending(): Promise<PendingOrder[]> {
  const res = await fetch(`${BASE_URL}/api/print/pending`, {
    headers: {
      "x-print-agent-secret": AGENT_SECRET,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`pending endpoint failed (${res.status}): ${txt}`);
  }

  const json = await res.json();
  return Array.isArray(json?.orders) ? json.orders : [];
}

async function ackPrinted(ids: string[]) {
  if (!ids.length) return;

  const res = await fetch(`${BASE_URL}/api/print/ack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-print-agent-secret": AGENT_SECRET,
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ack endpoint failed (${res.status}): ${txt}`);
  }
}

async function printOrder(order: PendingOrder): Promise<boolean> {
  const printerService = await getPrinterService();
  if (!printerService) return false;

  const printed = await printerService.printReceipt({
    orderId: order.id,
    date: new Date(order.createdAt).toLocaleString("ar-EG"),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: `${order.address}, ${order.city}`,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || undefined,
      color: item.color || undefined,
    })),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    discountPct: order.discountPct,
    shippingFee: order.shippingFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
  });

  return printed;
}

async function pollOnce() {
  const orders = await fetchPending();
  if (!orders.length) return;

  console.log(`Found ${orders.length} order(s) pending print`);

  const printedIds: string[] = [];

  for (const order of orders) {
    try {
      const ok = await printOrder(order);
      if (ok) {
        printedIds.push(order.id);
        console.log(`Printed: ${order.id}`);
      } else {
        console.error(`Print failed: ${order.id}`);
      }
    } catch (error) {
      console.error(`Print error for ${order.id}:`, error);
    }
  }

  if (printedIds.length) {
    await ackPrinted(printedIds);
    console.log(`Acknowledged ${printedIds.length} printed order(s)`);
  }
}

async function start() {
  console.log(`Print agent started. Polling ${BASE_URL} every ${POLL_MS}ms`);

  while (true) {
    try {
      await pollOnce();
    } catch (error) {
      console.error("Polling error:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

start().catch((error) => {
  console.error("Fatal agent error:", error);
  process.exit(1);
});
