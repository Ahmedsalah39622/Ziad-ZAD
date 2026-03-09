"use client";

import { useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesChartProps {
    dailyStats: { date: string; revenue: number; orders: number }[];
    ordersByStatus: { status: string; count: number }[];
    topProducts: { name: string; quantity: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function SalesChart({ dailyStats, ordersByStatus, topProducts }: SalesChartProps) {
    const [activeTab, setActiveTab] = useState<"revenue" | "status" | "products">("revenue");

    const formattedDailyStats = useMemo(() => {
        if (!dailyStats || dailyStats.length === 0) return [];
        return [...dailyStats].reverse().map(stat => {
            const dateObj = new Date(stat.date);
            return {
                ...stat,
                displayDate: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            };
        });
    }, [dailyStats]);

    const formattedTopProducts = useMemo(() => {
        if (!topProducts || topProducts.length === 0) return [];
        return topProducts.slice(0, 5).map(p => ({
            name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
            quantity: p.quantity
        }));
    }, [topProducts]);

    const tabs = [
        { id: "revenue", label: "Revenue Trend" },
        { id: "status", label: "Order Status" },
        { id: "products", label: "Top Products" },
    ];

    return (
        <Card className="border-border bg-card text-foreground col-span-full h-full min-h-[450px] flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold">Sales Analysis</CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">Performance insights by category.</CardDescription>
                    </div>

                    <div className="flex bg-muted/50 p-1 rounded-lg w-full sm:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as "revenue" | "status" | "products")}
                                className={`relative flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground/80"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 bg-background shadow-sm rounded-md border border-border/50"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 w-full relative min-h-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 pt-4"
                    >
                        {activeTab === "revenue" && (
                            formattedDailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={formattedDailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            labelStyle={{ fontWeight: 'bold' }}
                                            formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 italic text-sm">
                                    No revenue data available
                                </div>
                            )
                        )}

                        {activeTab === "status" && (
                            ordersByStatus && ordersByStatus.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => [value, "Orders"]}
                                        />
                                        <Pie
                                            data={ordersByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="status"
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {ordersByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 italic text-sm">
                                    No order status data available
                                </div>
                            )
                        )}

                        {activeTab === "products" && (
                            formattedTopProducts.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formattedTopProducts} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => [value, "Quantity Sold"]}
                                        />
                                        <Bar
                                            dataKey="quantity"
                                            fill="#10b981"
                                            radius={[0, 4, 4, 0]}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                            {formattedTopProducts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/50 italic text-sm">
                                    No product sales data available
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
