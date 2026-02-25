import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ListTree,
    ShoppingCart,
    Tag,
    Settings,
    LogOut,
    ChevronRight,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth-actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Strict Role-Based Access Control
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Categories", href: "/admin/categories", icon: ListTree },
        { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { label: "Discounts", href: "/admin/discounts", icon: Tag },
        { label: "Settings", href: "/admin/settings", icon: Settings },
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
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </div>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
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
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
                    <Link href="/admin" className="text-lg font-bold">ZAD ADMIN</Link>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </header>

                <main className="p-6 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
