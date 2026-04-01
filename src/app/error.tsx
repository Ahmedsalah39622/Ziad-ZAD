"use client";

import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error("[ZAD] Error Page - Full Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  if (!mounted) {
    return null;
  }

  const isDatabaseError = error.message?.includes("database") || error.message?.includes("DATABASE_URL");
  const isNetworkError = error.message?.includes("fetch") || error.message?.includes("network");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Oops!</h1>
          <p className="text-muted-foreground mb-4">
            {isDatabaseError
              ? "Database connection issue"
              : isNetworkError
              ? "Network connection issue"
              : "Something went wrong"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <p className="text-xs text-muted-foreground font-mono mb-2">Error Details:</p>
          <div className="bg-secondary/20 rounded p-3 text-sm overflow-auto max-h-40">
            <p className="text-foreground font-mono text-xs break-words whitespace-pre-wrap">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="text-muted-foreground text-xs mt-2">ID: {error.digest}</p>
            )}
          </div>
        </div>

        {isDatabaseError && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-4 mb-6 text-sm">
            <p className="text-blue-900 dark:text-blue-100 font-semibold mb-1">
              Database Configuration Issue
            </p>
            <p className="text-blue-800 dark:text-blue-200 text-xs">
              Please ensure DATABASE_URL environment variable is set correctly on your deployment platform (Vercel, etc.).
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded font-medium hover:opacity-90 transition-opacity"
          >
            Home
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          If this persists, please check the browser console for more details.
        </p>
      </div>
    </div>
  );
}
