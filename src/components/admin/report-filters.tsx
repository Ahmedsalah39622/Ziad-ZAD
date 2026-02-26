"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Search,
    Filter,
    RefreshCcw,
    Printer,
    FileSpreadsheet
} from "lucide-react";

interface ReportFiltersProps {
    totalCount: number;
}

export function ReportFilters({ totalCount }: ReportFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = searchParams.get("tab") || "revenue";
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const createQueryString = useCallback(
        (paramsToUpdate: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(paramsToUpdate).forEach(([name, value]) => {
                if (value) {
                    params.set(name, value);
                } else {
                    params.delete(name);
                }
            });
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = () => {
        router.push(`${pathname}?${createQueryString({ q: searchQuery })}`);
    };

    const handleReset = () => {
        setSearchQuery("");
        router.push(pathname + (activeTab !== "revenue" ? `?tab=${activeTab}` : ""));
    };

    const getTabLabel = () => {
        switch (activeTab) {
            case "revenue": return "Revenue Report";
            case "clients": return "Clients Report";
            case "orders": return "Orders Report";
            case "products": return "Products Report";
            default: return "Business Report";
        }
    };

    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case "clients": return "Client Name or Phone...";
            case "products": return "Product Name or ID...";
            case "orders": return "Order ID or Email...";
            default: return "Search records...";
        }
    };

    return (
        <div className="space-y-6 no-print mb-8">
            {/* Top Bar: Export & Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-rose-500/50 text-rose-500 hover:bg-rose-500/10 font-black uppercase text-[10px]"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" /> Export PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 font-black uppercase text-[10px]"
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Export Excel
                    </Button>
                </div>

                <div className="text-right">
                    <h2 className="text-xl font-black uppercase tracking-tighter">{getTabLabel()}</h2>
                </div>
            </div>

            {/* Filter Section */}
            <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    <Filter className="h-3 w-3 text-primary" /> Filters
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9 h-10 text-xs font-medium bg-background border-border"
                                defaultValue={searchParams.get("startDate") || ""}
                                onChange={(e) => router.push(`${pathname}?${createQueryString({ startDate: e.target.value })}`)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9 h-10 text-xs font-medium bg-background border-border"
                                defaultValue={searchParams.get("endDate") || ""}
                                onChange={(e) => router.push(`${pathname}?${createQueryString({ endDate: e.target.value })}`)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search</label>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder={getSearchPlaceholder()}
                                className="pl-9 h-10 text-xs font-medium bg-background border-border"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 h-10">
                        <Button
                            className="bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest text-[10px] flex-1 gap-2"
                            onClick={handleSearch}
                        >
                            <RefreshCcw className="h-3.5 w-3.5" /> Apply
                        </Button>
                        <Button
                            variant="ghost"
                            className="font-black uppercase tracking-widest text-[10px] border border-border gap-2"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {/* Total Count Box */}
            <div className="flex justify-end">
                <div className="bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-3 text-white shadow-lg shadow-indigo-500/20">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Count:</span>
                    <span className="text-xl font-black font-mono leading-none">{totalCount}</span>
                </div>
            </div>
        </div>
    );
}
