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

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats().catch(() => ({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        recentOrders: [],
        ordersByStatus: []
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
                <p className="text-zinc-500">Overview of your business performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title} className="border-white/10 bg-zinc-950 text-white shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                {card.title}
                            </CardTitle>
                            <card.icon className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="mt-1 flex items-center text-xs text-zinc-500">
                                {card.trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />}
                                {card.trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />}
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card className="border-white/10 bg-zinc-950 text-white">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription className="text-zinc-500">Latest transactions from your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.length === 0 ? (
                                <p className="text-sm text-zinc-600 italic">No recent orders found.</p>
                            ) : (
                                stats.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900/50 p-3">
                                        <div>
                                            <p className="text-sm font-medium">{order.customerName}</p>
                                            <p className="text-xs text-zinc-500">{order.customerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                                            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution placeholder */}
                <Card className="border-white/10 bg-zinc-950 text-white">
                    <CardHeader>
                        <CardTitle>Sales Analysis</CardTitle>
                        <CardDescription className="text-zinc-500">Performance insights by category.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex h-64 items-center justify-center border-t border-white/5 italic text-zinc-700">
                        [ Sales visualization coming soon ]
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
