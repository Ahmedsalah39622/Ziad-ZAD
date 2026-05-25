"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export function PrinterHomeButton() {
    const router = useRouter();

    return (
        <div className="flex w-full gap-2 justify-between">
            <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Button
                onClick={() => window.print()}
                className="bg-black hover:bg-black/90 text-white"
            >
                <Printer className="mr-2 h-4 w-4" />
                Print Label
            </Button>
        </div>
    );
}
