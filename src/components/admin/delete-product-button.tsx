"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/product-actions";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, name }: { id: string, name: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setIsLoading(true);
        try {
            await deleteProduct(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Failed to delete product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-8 w-8 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
