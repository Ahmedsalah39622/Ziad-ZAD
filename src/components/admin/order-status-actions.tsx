"use client";

import { useState } from "react";
import { printOrderReceipt, updateOrderStatus } from "@/lib/actions/order-actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Truck, Loader2, Check, Printer } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrderStatusActionsProps {
    orderId: string;
    currentStatus: string;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdateStatus = async (status: string) => {
        setIsLoading(status);
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order marked as ${status.toLowerCase()}`);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setIsLoading(null);
        }
    };

    const handlePrint = async () => {
        setIsLoading("PRINT");
        try {
            const result = await printOrderReceipt(orderId);
            if (result.success) {
                toast.success("Receipt printed successfully");
            } else if (result.warning) {
                toast.info(result.warning);
            } else {
                toast.error(result.error || "Failed to print receipt");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to print receipt");
        } finally {
            setIsLoading(null);
        }
    };

    if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
        return null; // No further actions needed for these statuses
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                disabled={!!isLoading}
                className="h-8 w-8 text-muted-foreground hover:text-foreground no-print"
                title="Print Order"
            >
                {isLoading === "PRINT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            </Button>
            {currentStatus === "PENDING" && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={!!isLoading}
                    className="h-8 w-8 text-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                    title="Confirm Order"
                >
                    {isLoading === "CONFIRMED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
            )}
            {currentStatus !== "DONE" && currentStatus !== "PENDING" && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus("DONE")}
                    disabled={!!isLoading}
                    className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                    title="Mark as Done"
                >
                    {isLoading === "DONE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdateStatus("DELIVERED")}
                disabled={!!isLoading}
                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                title="Mark as Delivered"
            >
                {isLoading === "DELIVERED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            </Button>
        </div>
    );
}
