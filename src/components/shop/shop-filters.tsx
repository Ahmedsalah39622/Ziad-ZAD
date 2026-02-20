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
                                    ? "bg-white text-black border-white"
                                    : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-white"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="items-center gap-4 hidden lg:flex shrink-0">
                    <SlidersHorizontal className="w-4 h-4 text-neutral-600" />
                    <select className="bg-transparent text-xs font-bold tracking-wider uppercase focus:outline-none cursor-pointer text-neutral-400">
                        <option className="bg-[#0a0a0a]">Featured</option>
                        <option className="bg-[#0a0a0a]">Newest</option>
                        <option className="bg-[#0a0a0a]">Price: High-Low</option>
                        <option className="bg-[#0a0a0a]">Price: Low-High</option>
                    </select>
                </div>

            </div>
        </div>
    );
}
