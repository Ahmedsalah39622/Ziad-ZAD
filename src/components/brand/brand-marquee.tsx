"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

interface BrandMarqueeProps {
    className?: string;
}

export function BrandMarquee({ className }: BrandMarqueeProps) {
    const brandName = "Z A D";

    return (
        <div className={cn("w-full py-8 md:py-12", className)}>
            <InfiniteSlider speed={40} gap={64}>
                {Array.from({ length: 15 }).map((_, i) => (
                    <span
                        key={i}
                        className="text-4xl md:text-6xl font-black tracking-[0.2em] md:tracking-[0.4em] text-foreground uppercase select-none whitespace-nowrap"
                    >
                        {brandName}
                    </span>
                ))}
            </InfiniteSlider>
        </div>
    );
}
