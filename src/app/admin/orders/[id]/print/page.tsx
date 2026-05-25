export const dynamic = 'force-dynamic';

import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/format-currency";
import { PrinterHomeButton } from "@/components/admin/printer-home-button";

export default async function OrderPrintPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = order.shippingFee || 0;
    const discountAmount = order.discountPct > 0 ? (subtotal * order.discountPct) / 100 : 0;
    const finalTotal = order.total;

    return (
        <div className="min-h-screen bg-zinc-100 py-10 print:bg-white print:py-0 flex flex-col items-center">
            {/* Styles for exact thermal printer sizing (80mm Width) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-receipt-container {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        padding: 6mm 6mm 4mm 6mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        page-break-inside: avoid;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />

            {/* Action Bar - Hidden on print */}
            <div className="w-[80mm] mb-6 flex justify-between gap-4 print:hidden no-print">
                <PrinterHomeButton />
            </div>

            {/* Receipt Container */}
            <div className="print-receipt-container w-[80mm] bg-white p-6 shadow-md border border-zinc-200 print:shadow-none print:border-none font-mono text-[11px] leading-relaxed text-black box-border">
                
                {/* Header */}
                <div className="text-center space-y-1 mb-4">
                    <h1 className="text-xl font-bold tracking-wider">ZAD</h1>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-600">Break Your Limits</p>
                    <p className="text-[8px] text-zinc-500">www.zadfitt.com</p>
                </div>

                {/* Metadata */}
                <div className="border-t border-b border-dashed border-black py-2 my-3 space-y-1">
                    <div className="flex justify-between">
                        <span>ORDER ID:</span>
                        <span className="font-bold">#{order.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>DATE:</span>
                        <span>{new Date(order.createdAt).toLocaleString("ar-EG", {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>PAYMENT:</span>
                        <span className="font-bold">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</span>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-4 space-y-1">
                    <div className="font-bold uppercase border-b border-black pb-1 mb-2">Customer Details</div>
                    <div className="flex justify-between">
                        <span>NAME:</span>
                        <span className="font-bold">{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TEL:</span>
                        <span className="font-bold">{order.customerPhone}</span>
                    </div>
                    <div className="text-left pt-1">
                        <span className="block font-bold">ADDRESS:</span>
                        <span className="block text-zinc-700">{order.address}, {order.city}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                    <div className="font-bold uppercase border-b border-black pb-1 mb-2">Items</div>
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="border-b border-dashed border-black">
                                <th className="py-1 font-normal">Desc</th>
                                <th className="py-1 text-center font-normal">Qty</th>
                                <th className="py-1 text-right font-normal">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => {
                                const details = [];
                                if (item.size) details.push(item.size);
                                if (item.color) details.push(item.color);
                                const detailsStr = details.length > 0 ? ` (${details.join('/')})` : '';

                                return (
                                    <tr key={idx} className="border-b border-zinc-100 last:border-none align-top">
                                        <td className="py-2 pr-2">
                                            <div className="font-medium">{item.product.name}</div>
                                            {detailsStr && <div className="text-[9px] text-zinc-500 font-sans">{detailsStr}</div>}
                                        </td>
                                        <td className="py-2 text-center">{item.quantity}</td>
                                        <td className="py-2 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="border-t border-dashed border-black pt-3 space-y-1.5">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {order.discountCode && (
                        <div className="flex justify-between text-zinc-600">
                            <span>Discount ({order.discountCode}):</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="border-t border-black pt-2 flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(finalTotal)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 space-y-1">
                    <p className="text-[9px]">Thank you for shopping with us!</p>
                </div>
            </div>

            {/* Auto Print Script */}
            <script dangerouslySetInnerHTML={{ __html: `window.print();` }} />
        </div>
    );
}
