import { getDashboardStats } from "@/lib/actions/order-actions";
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { SalesChart } from "@/components/admin/sales-chart";

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats().catch(() => ({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        recentOrders: [],
        ordersByStatus: [],
        dailyStats: [],
        topProducts: [],
        clientStats: [],
        lowStockProducts: []
    }));

    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            description: "+12.5% from last month",
            icon: TrendingUp,
            trend: "up"
        },
        {
            title: "Orders",
            value: stats.totalOrders.toString(),
            description: "+4 new today",
            icon: ShoppingCart,
            trend: "up"
        },
        {
            title: "Active Products",
            value: stats.totalProducts.toString(),
            description: "2 out of stock",
            icon: Package,
            trend: "neutral"
        },
        {
            title: "Customers",
            value: stats.totalCustomers.toString(),
            description: "+15% this week",
            icon: Users,
            trend: "up"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your business performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title} className="border-border bg-card text-foreground shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="mt-1 flex items-center text-xs text-muted-foreground">
                                {card.trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 text-foreground" />}
                                {card.trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />}
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Orders */}
                <Card className="border-border bg-card text-foreground">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription className="text-muted-foreground">Latest transactions from your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.length === 0 ? (
                                <p className="text-sm text-foreground font-bold uppercase">Free for all orders</p>
                            ) : (
                                stats.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 p-3">
                                        <div>
                                            <p className="text-sm font-medium">{order.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                                            <span className="inline-flex items-center rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold text-foreground uppercase">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Customers */}
                <Card className="border-border bg-card text-foreground">
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription className="text-muted-foreground">Your most valuable clients by total spend.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!stats.clientStats || stats.clientStats.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">No customer data available</p>
                            ) : (
                                stats.clientStats.slice(0, 5).map((client: { name: string; email: string; totalSpent: number; orderCount: number }, index: number) => (
                                    <div key={client.email || index} className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium line-clamp-1">{client.name || "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right whitespace-nowrap ml-2">
                                            <p className="text-sm font-bold">{formatCurrency(client.totalSpent)}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{client.orderCount} orders</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card className="border-border bg-card text-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Low Stock Alerts
                            {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-500">
                                    {stats.lowStockProducts.length}
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Products that need restocking soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!stats.lowStockProducts || stats.lowStockProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-foreground font-medium">Stock levels look good</p>
                                    <p className="text-xs text-muted-foreground">No items are currently running low.</p>
                                </div>
                            ) : (
                                stats.lowStockProducts.map((product: { id: string; name: string; stock: number }) => (
                                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-border bg-foreground/5 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">Product ID: {product.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="text-right whitespace-nowrap ml-2">
                                            <p className="text-sm font-bold text-rose-500">{product.stock} left</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">In Stock</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Chart row */}
            <div className="grid gap-6">
                <SalesChart
                    dailyStats={stats.dailyStats || []}
                    ordersByStatus={stats.ordersByStatus || []}
                    topProducts={stats.topProducts || []}
                />
            </div>
        </div>
    );
}
