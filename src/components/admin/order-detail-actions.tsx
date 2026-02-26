"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";

interface OrderDetailActionsProps {
    orderId: string;
    currentStatus: string;
    nextStatusLabel?: string;
    nextStatusId?: string;
}

export function OrderDetailActions({
    orderId,
    currentStatus,
    nextStatusLabel,
    nextStatusId
}: OrderDetailActionsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleUpdateStatus = async (status: string) => {
        setIsLoading(status);
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order marked as ${status.toLowerCase()}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setIsLoading(null);
        }
    };

    if (currentStatus === "CANCELLED") return null;

    return (
        <div className="flex flex-wrap gap-3">
            <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-border text-foreground hover:bg-foreground/5 font-bold uppercase text-xs tracking-widest no-print"
            >
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
            {nextStatusId && currentStatus !== 'DELIVERED' && (
                <Button
                    onClick={() => handleUpdateStatus(nextStatusId)}
                    disabled={!!isLoading}
                    className="bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase text-xs tracking-widest px-8 min-w-[160px]"
                >
                    {isLoading === nextStatusId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        `Mark as ${nextStatusLabel}`
                    )}
                </Button>
            )}

            {currentStatus !== 'DELIVERED' && (
                <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    disabled={!!isLoading}
                    className="border-border text-foreground hover:bg-foreground/5 font-bold uppercase text-xs tracking-widest"
                >
                    {isLoading === 'DELIVERED' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Skip to Delivered"
                    )}
                </Button>
            )}

            <Button
                variant="ghost"
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={!!isLoading}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold uppercase text-xs tracking-widest"
            >
                {isLoading === 'CANCELLED' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    "Cancel Order"
                )}
            </Button>
        </div>
    );
}
