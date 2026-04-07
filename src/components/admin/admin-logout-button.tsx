"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
    return (
        <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </Button>
    );
}
