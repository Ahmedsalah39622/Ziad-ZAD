"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { printOrderReceipt } from "@/lib/actions/order-actions";

export function AdminPrintButton({ orderId }: { orderId: string }) {
    const [isPrinting, setIsPrinting] = useState(false);

    async function handlePrint() {
        setIsPrinting(true);
        try {
            const result = await printOrderReceipt(orderId);
            
            if (result.success) {
                toast.success("✅ Receipt printed successfully!");
            } else if (result.warning) {
                toast.info(`⚠️ ${result.warning}`);
            } else {
                toast.error(`❌ ${result.error || "Failed to print receipt"}`);
            }
        } catch (error) {
            toast.error("❌ An error occurred while printing");
            console.error("Print error:", error);
        } finally {
            setIsPrinting(false);
        }
    }

    return (
        <Button
            onClick={handlePrint}
            disabled={isPrinting}
            variant="outline"
            className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10"
        >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Printing..." : "Print Receipt"}
        </Button>
    );
}
