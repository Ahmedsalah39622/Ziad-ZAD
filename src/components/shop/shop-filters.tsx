"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

const filters = ["All", "New Releases", "Tops", "Bottoms", "Outerwear", "Accessories"];

export function ShopFilters() {
    const [activeFilter, setActiveFilter] = useState("All");

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
                    <select className="bg-transparent text-xs font-bold tracking-wider uppercase focus:outline-none cursor-pointer text-muted-foreground/60">
                        <option className="bg-background">Featured</option>
                        <option className="bg-background">Newest</option>
                        <option className="bg-background">Price: High-Low</option>
                        <option className="bg-background">Price: Low-High</option>
                    </select>
                </div>

            </div>
        </div>
    );
}
