"use client";

import { useEffect, useState } from "react";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("[ZAD] Client hydration completed");
  }, []);

  if (!mounted) {
    return (
      <div 
        className="min-h-screen w-full bg-background"
        suppressHydrationWarning
      />
    );
  }

  return <>{children}</>;
}
