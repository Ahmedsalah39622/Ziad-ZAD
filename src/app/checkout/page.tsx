import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <main className="min-h-screen bg-black pt-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter text-white mb-8 uppercase italic border-l-4 border-white pl-4">
          Checkout
        </h1>
        <CheckoutClient user={session.user} />
      </div>
    </main>
  );
}
