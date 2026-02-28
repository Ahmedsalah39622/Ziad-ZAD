"use client";

import { getMobileRedirectUrl } from "@/lib/redirect";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Success() {
  const params = useSearchParams();
  const transactionId = params.get("transaction_id");

  return (
    <div className="grid h-dvh place-items-center px-4 py-12 bg-background font-inter">
      <div className="text-center space-y-6 max-w-md w-full p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 rounded-full bg-foreground/10 flex items-center justify-center relative">
            <CheckCircle2 className="h-12 w-12 text-foreground" />
            <div className="absolute inset-0 rounded-full border border-foreground/20 animate-ping opacity-20" />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">
          Order Confirmed
        </h1>

        <p className="text-muted-foreground">
          Thank you for your purchase. Your payment was successful and your order is being processed.
        </p>

        {transactionId && (
          <div className="pt-6 border-t border-border mt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">Transaction ID: {transactionId}</p>
            <a
              href={getMobileRedirectUrl(transactionId)}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:opacity-90 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to App
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense>
      <Success />
    </Suspense>
  );
}
