"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportActions() {
    return (
        <Button
            onClick={() => window.print()}
            className="bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest text-xs h-12 px-8 no-print"
        >
            <Printer className="mr-2 h-4 w-4" />
            Print Report (A4)
        </Button>
    );
}
