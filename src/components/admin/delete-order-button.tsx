"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrder } from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteOrder(orderId);
            toast.success("Order deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete order");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete Order"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
