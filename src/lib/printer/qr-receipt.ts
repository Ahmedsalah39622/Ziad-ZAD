import QRCode from "qrcode";
import type { Order, OrderItem } from "@prisma/client";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function generateReceiptQR(order: OrderWithItems): Promise<string> {
  // Create QR data with order details
  const qrData = JSON.stringify({
    orderId: order.id,
    total: order.total,
    customerName: order.customerName,
    date: order.createdAt.toISOString(),
  });

  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return qrCode;
}

export function formatReceiptData(
  order: OrderWithItems,
  qrCode: string
) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * order.discountPct) / 100;
  const finalTotal = subtotal - discountAmount + order.shippingFee;

  return {
    orderId: order.id,
    date: new Date(order.createdAt).toLocaleString("ar-EG"),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: `${order.address}, ${order.city}`,
    items: order.items.map((item) => ({
      name: item.productId, // This should come from product lookup
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
    })),
    subtotal,
    discountAmount: order.discountPct > 0 ? discountAmount : 0,
    discountPct: order.discountPct,
    shippingFee: order.shippingFee,
    total: finalTotal,
    paymentMethod: order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment",
    qrCode,
  };
}
