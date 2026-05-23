import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";
import { getSetting } from "@/lib/actions/settings-actions";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  let shippingFee = 0;
  try {
    const shippingFeeStr = await getSetting("global_shipping_fee", "0");
    shippingFee = parseFloat(shippingFeeStr) || 0;
  } catch {
    // DB unavailable — default shipping fee 0
  }

  return (
    <main className="min-h-screen bg-background pt-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-8 uppercase italic border-l-4 border-foreground pl-4">
          Checkout
        </h1>
        <CheckoutClient user={session.user} shippingFee={shippingFee} />
      </div>
    </main>
  );
}
