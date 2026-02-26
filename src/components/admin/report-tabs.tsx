"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
    CreditCard,
    Users,
    ShoppingBag,
    Package,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

const tabs: Tab[] = [
    { id: "revenue", label: "Revenue", icon: CreditCard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
];

export function ReportTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "revenue";

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    return (
        <div className="flex border-b border-border mb-8 overflow-x-auto no-print">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            router.push(`${pathname}?${createQueryString("tab", tab.id)}`);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                            isActive
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
