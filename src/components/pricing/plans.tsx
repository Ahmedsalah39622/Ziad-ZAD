"use client";

import { CheckIcon, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "ZAD Insider",
    description: "Your gateway into the world of premium streetwear.",
    price: "Free",
    monthly: true,
    features: [
      "Access to standard drops",
      "Community forum access",
      "Standard shipping rates",
      "Digital lookbooks",
    ],
    cta: "Join for Free",
    href: "/register",
    featured: false,
  },
  {
    name: "ZAD Obsidian",
    description: "The ultimate Elite Membership for the chosen few.",
    price: "L.E 500",
    monthly: true,
    features: [
      "24-Hour early access to all drops",
      "Free expedited shipping worldwide",
      "Exclusive 'Obsidian' only colorways",
      "Private VIP Discord & Events",
      "Dedicated concierge support",
    ],
    cta: "Become Elite",
    href: "/checkout?plan=obsidian",
    featured: true,
  },
];

export function Plans() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-16 max-w-2xl text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
          ZAD Elite Memberships
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          We don&apos;t just design clothes. We engineer movement. Join the absolute pinnacle of streetwear culture.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col justify-between rounded-2xl border p-8 shadow-xl transition-all duration-300 hover:scale-[1.02] ${tier.featured
                ? "border-foreground bg-foreground text-background shadow-foreground/20"
                : "border-border bg-card text-foreground"
              }`}
          >
            {/* Featured Badge */}
            {tier.featured && (
              <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
                <Star className="h-3 w-3 fill-foreground" />
                <span>Premium Tier</span>
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className={`text-2xl font-black uppercase tracking-tight ${tier.featured ? "text-background" : "text-foreground"}`}>
                  {tier.name}
                </h3>
                <p className={`mt-2 text-sm ${tier.featured ? "text-background/80" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline text-4xl font-black">
                {tier.price}
                {tier.monthly && tier.price !== "Free" && (
                  <span className={`ml-1 text-sm font-normal ${tier.featured ? "text-background/70" : "text-muted-foreground"}`}>
                    /month
                  </span>
                )}
              </div>

              <ul className="mb-8 space-y-4 flex-1">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                    <div className={`mt-0.5 rounded-full p-0.5 ${tier.featured ? "bg-background text-foreground" : "bg-foreground text-background"}`}>
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    <span className={tier.featured ? "text-background/90" : "text-foreground/80"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              asChild
              className={`w-full py-6 text-sm font-bold uppercase tracking-wider ${tier.featured
                  ? "bg-background text-foreground hover:bg-background/90"
                  : "bg-foreground text-background hover:bg-foreground/90"
                }`}
            >
              <Link href={tier.href}>{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 flex gap-6 text-xs uppercase tracking-widest text-muted-foreground/60">
        <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
        <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
      </div>
    </div>
  );
}
