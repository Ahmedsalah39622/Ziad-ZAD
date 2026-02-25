import { getOrders } from "@/lib/actions/order-actions";
import { Search, Eye, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format-currency";
import Link from "next/link";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";

export default async function OrdersPage() {
    const orders = await getOrders();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-foreground/5 text-muted-foreground';
            case 'CONFIRMED': return 'bg-foreground/10 text-foreground';
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
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground/40 italic">No orders found.</td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const productsSummary = order.items
                                    .map(item => `${item.product.name} x${item.quantity}`)
                                    .join(", ");

                                return (
                                    <tr key={order.id} className="hover:bg-foreground/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-muted-foreground/40 text-xs uppercase">{order.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground font-medium">{order.customerName}</div>
                                            <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="truncate text-xs text-muted-foreground font-mono" title={productsSummary}>
                                                {productsSummary}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">
                                            {order.discountCode ? `${order.discountCode} (${order.discountPct}%)` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteOrderButton orderId={order.id} />
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
