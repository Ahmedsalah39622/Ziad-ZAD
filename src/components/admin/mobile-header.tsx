"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

interface MobileHeaderProps {
    navItems: NavItem[];
}

export function MobileHeader({ navItems }: MobileHeaderProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
            <Link href="/admin" className="text-lg font-bold">
                ZAD ADMIN
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetHeader className="h-16 border-b border-border px-6 flex items-start justify-center text-left">
                        <SheetTitle className="text-xl font-bold tracking-tighter mt-4">
                            <Link href="/admin" onClick={() => setOpen(false)}>
                                ZAD <span className="text-muted-foreground">ADMIN</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="space-y-1 px-4 py-6">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                    <ChevronRight
                                        className={`h-3 w-3 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
