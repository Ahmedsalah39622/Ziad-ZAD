"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton({ orderId }: { orderId: string }) {
    function handlePrint() {
        window.open(`/admin/orders/${orderId}/print`, "_blank");
    }

    return (
        <Button
            onClick={handlePrint}
            variant="outline"
            className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider"
        >
            <Printer className="h-5 w-5 mr-2" />
            Print Receipt
        </Button>
    );
}
