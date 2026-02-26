"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/format-currency";
import Link from "next/link";
import { Eye, Mail, Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderItem = {
    productId: string;
    quantity: number;
    price: number;
    product: {
        name: string;
        price: number;
    };
};

type Order = {
    id: string;
    total: number;
    status: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    createdAt: Date;
    items: OrderItem[];
};

type ClientListProps = {
    clientStats: {
        name: string;
        email: string;
        phone: string;
        totalSpent: number;
        orderCount: number;
        lastOrder: Date;
    }[];
    allOrders: Order[];
};

export function ClientList({ clientStats, allOrders }: ClientListProps) {
    if (clientStats.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground italic">
                No clients found.
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-foreground/5 text-xs font-medium uppercase tracking-wider text-muted-foreground w-full">
                <div className="col-span-4 lg:col-span-3">Customer</div>
                <div className="col-span-3 lg:col-span-2 text-right">Total Spent</div>
                <div className="col-span-2 text-center">Orders</div>
                <div className="col-span-3 lg:col-span-4 text-center">Last Order</div>
                <div className="hidden lg:block lg:col-span-1" />
            </div>

            <Accordion type="single" collapsible className="w-full">
                {clientStats.map((client, index) => {
                    // Filter this specific client's orders
                    const clientOrders = allOrders.filter(o => o.customerEmail === client.email);

                    // Find their most detailed phone number/address from their last order, since basic stats might only have raw email
                    const lastOrderDetails = clientOrders[0]; // Orders arrive sorted descending
                    const displayPhone = lastOrderDetails?.customerPhone || client.phone;

                    return (
                        <AccordionItem key={`${client.email}-${index}`} value={`client-${index}`} className="group data-[state=open]:bg-foreground/[0.02] transition-colors">
                            {/* Accordion Trigger (The row summary) */}
                            <AccordionTrigger className="w-full px-6 py-4 hover:no-underline hover:bg-foreground/5">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-center text-left">
                                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                                        <div className="text-foreground font-bold truncate">{client.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{client.email}</div>
                                    </div>

                                    <div className="col-span-12 md:col-span-3 lg:col-span-2 md:text-right font-black text-foreground">
                                        <span className="md:hidden text-muted-foreground font-normal text-xs uppercase mr-2">Total Spent:</span>
                                        {formatCurrency(client.totalSpent)}
                                    </div>

                                    <div className="col-span-6 md:col-span-2 md:text-center text-sm">
                                        <span className="md:hidden text-muted-foreground font-normal text-xs uppercase mr-2">Orders:</span>
                                        {client.orderCount}
                                    </div>

                                    <div className="col-span-6 md:col-span-3 lg:col-span-4 md:text-center text-xs text-muted-foreground font-mono">
                                        <span className="md:hidden text-foreground font-normal text-xs uppercase mr-2">Last Order:</span>
                                        {new Date(client.lastOrder).toLocaleDateString()}
                                    </div>
                                </div>
                            </AccordionTrigger>

                            {/* Accordion Content (The expanded details) */}
                            <AccordionContent className="border-t border-border/50 bg-background/50">
                                <div className="p-6 space-y-8">

                                    {/* Personal Info Bar */}
                                    <div className="flex flex-col md:flex-row gap-6 md:items-center bg-card border border-border/50 p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Email</span>
                                                <a href={`mailto:${client.email}`} className="text-sm font-medium hover:underline">{client.email}</a>
                                            </div>
                                        </div>

                                        <div className="hidden md:block w-px h-8 bg-border" />

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Phone</span>
                                                {displayPhone ? (
                                                    <a href={`tel:${displayPhone}`} className="text-sm font-medium hover:underline">{displayPhone}</a>
                                                ) : (
                                                    <span className="text-sm italic text-muted-foreground">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order History Table */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4" />
                                            Order History
                                        </h4>
                                        <div className="rounded-md border border-border/50 overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-foreground/5 border-b border-border/50 text-[10px] uppercase text-muted-foreground">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Order ID</th>
                                                        <th className="px-4 py-3 font-medium">Date</th>
                                                        <th className="px-4 py-3 font-medium text-right">Items</th>
                                                        <th className="px-4 py-3 font-medium text-right">Total</th>
                                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                                        <th className="px-4 py-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {clientOrders.map(order => (
                                                        <tr key={order.id} className="hover:bg-foreground/[0.02] transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs opacity-70 uppercase">{order.id.substring(0, 8)}</td>
                                                            <td className="px-4 py-3 text-xs opacity-70">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-4 py-3 text-right text-xs">
                                                                {order.items.reduce((acc, curr) => acc + curr.quantity, 0)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-foreground tabular-nums">
                                                                {formatCurrency(order.total)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-foreground/10 text-foreground">
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Link href={`/admin/orders/${order.id}`}>
                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hover:bg-foreground hover:text-background">
                                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
