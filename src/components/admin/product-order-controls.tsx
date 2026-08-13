"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveProductOrder } from "@/lib/actions/product-actions";

interface ProductOrderControlsProps {
    productId: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

export function ProductOrderControls({ productId, canMoveUp, canMoveDown }: ProductOrderControlsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [activeDirection, setActiveDirection] = useState<"up" | "down" | null>(null);

    const handleMove = (direction: "up" | "down") => {
        setActiveDirection(direction);
        startTransition(async () => {
            try {
                await moveProductOrder(productId, direction);
                router.refresh();
            } finally {
                setActiveDirection(null);
            }
        });
    };

    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background p-1">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                onClick={() => handleMove("up")}
                disabled={!canMoveUp || isPending}
                aria-label="Move product up"
            >
                {isPending && activeDirection === "up" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                onClick={() => handleMove("down")}
                disabled={!canMoveDown || isPending}
                aria-label="Move product down"
            >
                {isPending && activeDirection === "down" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
        </div>
    );
}