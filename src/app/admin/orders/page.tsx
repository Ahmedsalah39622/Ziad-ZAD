export const dynamic = 'force-dynamic';

import { getOrders } from "@/lib/actions/order-actions";
import { Search, Eye, Filter, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format-currency";
import Link from "next/link";
import Image from "next/image";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrderStatusActions } from "@/components/admin/order-status-actions";

export default async function OrdersPage() {
    const orders = await getOrders();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-foreground/5 text-muted-foreground';
            case 'CONFIRMED': return 'bg-foreground/10 text-foreground';
            case 'DONE': return 'bg-emerald-500/10 text-emerald-500';
            case 'SHIPPED': return 'bg-foreground/20 text-foreground';
            case 'DELIVERED': return 'bg-foreground text-background';
            case 'CANCELLED': return 'bg-rose-500/10 text-rose-500';
            default: return 'bg-zinc-800 text-zinc-400';
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter uppercase">Orders</h1>
                <p className="text-muted-foreground">Track and manage customer orders.</p>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by order ID or customer name..."
                        className="border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/40 focus:border-border/50 focus:ring-0"
                    />
                </div>
                <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="border-b border-border bg-foreground/5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Products</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground/40 italic">No orders found.</td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                return (
                                    <tr key={order.id} className="hover:bg-foreground/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-muted-foreground/40 text-[10px] uppercase">{order.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground font-medium">{order.customerName}</div>
                                            <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {order.items.map((item, idx) => {
                                                    // Parse images if it's a string
                                                    const productImages = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : (item.product.images || []);
                                                    const firstImage = productImages[0]?.url || "";

                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 group">
                                                            <div className="relative h-10 w-10 shrink-0 rounded bg-secondary overflow-hidden border border-border">
                                                                {firstImage ? (
                                                                    <Image src={firstImage} alt={item.product.name} fill className="object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground"><ShoppingBag className="w-4 h-4" /></div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-bold text-foreground truncate">{item.product.name}</div>
                                                                <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                                                                    {item.size} / {item.color} <span className="text-foreground">x{item.quantity}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col gap-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="h-10 flex items-center justify-end text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {formatCurrency(item.price)}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-foreground whitespace-nowrap">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">
                                            {order.discountCode ? (
                                                <div className="flex flex-col">
                                                    <span className="text-primary font-bold">{order.discountCode}</span>
                                                    <span>({order.discountPct}%)</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 px-3 border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background font-black uppercase text-[10px] tracking-widest transition-all">
                                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                        Details
                                                    </Button>
                                                </Link>
                                                <div className="flex items-center gap-1 border-l border-border pl-2">
                                                    <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                                                    <DeleteOrderButton orderId={order.id} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
