"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider 
            refetchInterval={60} // Refetch session every 60 seconds (instead of constant polling)
            refetchOnWindowFocus={false} // Don't refetch when window gets focus
            refetchWhenOffline={false} // Don't try to refetch when offline
        >
            {children}
        </SessionProvider>
    );
}
