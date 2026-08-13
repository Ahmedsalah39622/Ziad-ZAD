"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const filters = ["All", "New Releases", "Tops", "Bottoms", "Outerwear", "Accessories"];

const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-desc", label: "Price: High-Low" },
    { value: "price-asc", label: "Price: Low-High" },
];

export function ShopFilters({ currentSort }: { currentSort?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedSort, setSelectedSort] = useState(currentSort || searchParams.get("sort") || "featured");

    useEffect(() => {
        setSelectedSort(currentSort || searchParams.get("sort") || "featured");
    }, [currentSort, searchParams]);

    const handleSortChange = (value: string) => {
        setSelectedSort(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value === "featured") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <div className="w-full px-6 md:px-12 py-6">
            <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-6">

                {/* Filter Pills */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-5 py-2.5 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 border",
                                activeFilter === filter
                                    ? "bg-foreground text-background border-foreground"
                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="items-center gap-4 hidden lg:flex shrink-0">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={selectedSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-transparent text-xs font-bold tracking-wider uppercase focus:outline-none cursor-pointer text-muted-foreground/60"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-background">
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
        </div>
    );
}
