export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShippingForm } from "./shipping-form";
import { getSetting } from "@/lib/actions/settings-actions";

export default async function ShippingFeesPage() {
    const session = await auth();

    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
        redirect("/admin/login");
    }

    const currentFeeStr = await getSetting("global_shipping_fee", "0");

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Shipping Fees</h1>
                <p className="text-muted-foreground">Manage global shipping configurations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <ShippingForm initialFee={currentFeeStr} />
            </div>
        </div>
    );
}
