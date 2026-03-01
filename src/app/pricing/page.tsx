import { Nav } from "@/components/hero/nav";
import { Plans } from "@/components/pricing/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZAD Elite Memberships | Premium Streetwear",
  description: "Join the ZAD Elite. Get exclusive access to Genesis Edition drops, premium perks, and free shipping.",
};

export default function Pricing() {
  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Premium Dark Gradient/Glare Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-foreground/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-foreground/5 blur-[120px]" />
      </div>

      <div className="relative z-20 px-8 pt-8">
        <Nav />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center py-20 px-6">
        <div className="mx-auto w-full max-w-6xl">
          <Plans />
        </div>
      </main>
    </div>
  );
}
