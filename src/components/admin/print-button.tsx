"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function AdminPrintButton({ orderId }: { orderId: string }) {
    function handlePrint() {
        window.open(`/admin/orders/${orderId}/print`, "_blank");
    }

    return (
        <Button
            onClick={handlePrint}
            variant="outline"
            className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10"
        >
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
        </Button>
    );
}
