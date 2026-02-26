import { generateDiscountCodes, getDiscountCodes } from "@/lib/actions/discount-actions";
import { DiscountCode } from "@prisma/client";

export const metadata = {
    title: "Discount Codes - Admin",
};

import { revalidatePath } from "next/cache";

export default async function DiscountsPage() {
    // server action invoked by the form
    async function createCodes(formData: FormData) {
        'use server';
        const quantity = parseInt(formData.get('quantity') as string) || 1;
        const discountPct = parseFloat(formData.get('discountPct') as string) || 0;
        const validDays = parseInt(formData.get('validDays') as string) || 0;
        const usesPerCode = parseInt(formData.get('usesPerCode') as string) || 1;

        await generateDiscountCodes({ quantity, discountPct, validDays: validDays || undefined, usesPerCode });
        revalidatePath("/admin/discounts");
    }

    let codes: DiscountCode[] = [];
    let loadError: string | null = null;
    try {
        codes = await getDiscountCodes();
    } catch (e) {
        loadError = e instanceof Error ? e.message : String(e);
        console.error("Failed to load discount codes:", e);
    }

    return (
        <div className="space-y-6">
            {loadError && (
                <div className="rounded-lg border border-rose-500 bg-rose-50 p-4 text-rose-800">
                    Error loading codes: {loadError}
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Discount Codes</h1>
                <p className="text-muted-foreground">Generate and view promotional codes.</p>
            </div>

            {/* creation form */}
            <div className="rounded-lg border border-border bg-card p-8 shadow-2xl">
                <form action={createCodes} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="quantity" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Quantity</label>
                        <input id="quantity" name="quantity" type="number" min={1} defaultValue={1} className="w-full border-border rounded-xl h-10" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="discountPct" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Discount (%)</label>
                        <input id="discountPct" name="discountPct" type="number" min={0} max={100} step={0.1} defaultValue={10} className="w-full border-border rounded-xl h-10" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="validDays" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Valid For (days)</label>
                        <input id="validDays" name="validDays" type="number" min={0} defaultValue={0} className="w-full border-border rounded-xl h-10" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="usesPerCode" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Uses per Code</label>
                        <input id="usesPerCode" name="usesPerCode" type="number" min={1} defaultValue={1} className="w-full border-border rounded-xl h-10" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold uppercase tracking-widest">
                            Generate Codes
                        </button>
                    </div>
                </form>
            </div>

            {/* codes table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="border-b border-border bg-foreground/5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Expires</th>
                            <th className="px-6 py-4">Uses/Max</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {codes.map((c) => (
                            <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                                <td className="px-6 py-4 font-mono">{c.code}</td>
                                <td className="px-6 py-4">{c.discountPct}%</td>
                                <td className="px-6 py-4">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'} </td>
                                <td className="px-6 py-4">{c.usedCount}/{c.usesPerCode}</td>
                                <td className="px-6 py-4">
                                    {c.usedCount >= c.usesPerCode ? (
                                        <span className="text-rose-500 font-bold">Used</span>
                                    ) : (
                                        <span className="text-emerald-500 font-bold">Active</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
