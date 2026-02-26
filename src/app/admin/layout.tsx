import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";

export const dynamic = "force-dynamic";

import {
    LogOut,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth-actions";

import { MobileHeader } from "@/components/admin/mobile-header";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Strict Role-Based Access Control
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
        redirect("/");
    }

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
        { label: "Products", href: "/admin/products", icon: "Package" },
        { label: "Categories", href: "/admin/categories", icon: "ListTree" },
        { label: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
        { label: "Clients", href: "/admin/clients", icon: "Users" },
        { label: "Shipping Fees", href: "/admin/shipping-fees", icon: "Truck" },
        { label: "Promo Codes", href: "/admin/discounts", icon: "Tag" },
        { label: "Product Sales", href: "/admin/product-discounts", icon: "BadgePercent" },
        { label: "New Releases", href: "/admin/new-releases", icon: "Sparkles" },
        { label: "Ribbon", href: "/admin/ribbon", icon: "Megaphone" },
        { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
        { label: "Settings", href: "/admin/settings", icon: "Settings" },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-border bg-card lg:block">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <Link href="/admin" className="text-xl font-bold tracking-tighter">
                        ZAD <span className="text-muted-foreground">ADMIN</span>
                    </Link>
                </div>

                <nav className="space-y-1 px-4 py-6">
                    {navItems.map((item) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore - Dynamic icon rendering
                        const IconComponent = Icons[item.icon] as React.ElementType;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {IconComponent && <IconComponent className="h-4 w-4" />}
                                    {item.label}
                                </div>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 w-full px-4">
                    <form action={logoutAction}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:pl-64">
                {/* Mobile Header */}
                <MobileHeader navItems={navItems} />

                <main className="p-6 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
