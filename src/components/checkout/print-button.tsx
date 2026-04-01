"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { printOrderReceipt } from "@/lib/actions/order-actions";

export function PrintButton({ orderId }: { orderId: string }) {
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
            className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider"
        >
            <Printer className="h-5 w-5 mr-2" />
            {isPrinting ? "Printing..." : "Print Receipt"}
        </Button>
    );
}
