export const dynamic = 'force-dynamic';

import { generateDiscountCodes, getDiscountCodes, updateDiscountCode, deleteDiscountCode } from "@/lib/actions/discount-actions";
import { DiscountCode } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "Discount Codes - Admin",
};

export default async function DiscountsPage() {
    // server action invoked by the form to create codes
    async function createCodes(formData: FormData) {
        'use server';
        const quantity = parseInt(formData.get('quantity') as string) || 1;
        const discountPct = parseFloat(formData.get('discountPct') as string) || 0;
        const validDays = parseInt(formData.get('validDays') as string) || 0;
        const usesPerCode = parseInt(formData.get('usesPerCode') as string) || 1;

        await generateDiscountCodes({ quantity, discountPct, validDays: validDays || undefined, usesPerCode });
        revalidatePath("/admin/discounts");
    }

    async function handleUpdateDiscount(formData: FormData) {
        'use server';
        const id = String(formData.get('id') || '');
        const code = String(formData.get('code') || '').trim();
        const discountPct = parseFloat(formData.get('discountPct') as string) || 0;
        const usesPerCode = parseInt(formData.get('usesPerCode') as string) || 1;
        const usedCount = parseInt(formData.get('usedCount') as string) || 0;
        const expiresAtRaw = formData.get('expiresAt') as string;
        const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

        if (!id) throw new Error('Discount ID is required');
        if (!code) throw new Error('Discount code is required');

        await updateDiscountCode(id, {
            code,
            discountPct,
            usesPerCode,
            usedCount,
            expiresAt
        });
        revalidatePath("/admin/discounts");
    }

    async function handleDeleteDiscount(formData: FormData) {
        'use server';
        const id = String(formData.get('id') || '');
        if (!id) throw new Error('Discount ID is required');

        await deleteDiscountCode(id);
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
                            <th className="px-6 py-4">Uses (Used / Max)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {codes.map((c) => {
                            const expiryValue = c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '';
                            return (
                                <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-mono">
                                        <input
                                            form={`update-discount-${c.id}`}
                                            name="code"
                                            defaultValue={c.code}
                                            required
                                            className="h-9 w-full max-w-[180px] rounded-md border border-border bg-background px-3 text-sm font-mono outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <input
                                                form={`update-discount-${c.id}`}
                                                name="discountPct"
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.1}
                                                defaultValue={c.discountPct}
                                                required
                                                className="h-9 w-20 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                            />
                                            <span>%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            form={`update-discount-${c.id}`}
                                            name="expiresAt"
                                            type="date"
                                            defaultValue={expiryValue}
                                            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                form={`update-discount-${c.id}`}
                                                name="usedCount"
                                                type="number"
                                                min={0}
                                                defaultValue={c.usedCount}
                                                required
                                                className="h-9 w-16 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                                title="Used Count"
                                            />
                                            <span>/</span>
                                            <input
                                                form={`update-discount-${c.id}`}
                                                name="usesPerCode"
                                                type="number"
                                                min={1}
                                                defaultValue={c.usesPerCode}
                                                required
                                                className="h-9 w-16 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                                title="Uses Per Code"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.usedCount >= c.usesPerCode ? (
                                            <span className="text-rose-500 font-bold">Used</span>
                                        ) : (
                                            <span className="text-emerald-500 font-bold">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <form id={`update-discount-${c.id}`} action={handleUpdateDiscount}>
                                                <input type="hidden" name="id" value={c.id} />
                                                <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Save Changes">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </form>
                                            <form action={handleDeleteDiscount}>
                                                <input type="hidden" name="id" value={c.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-500/70 hover:text-rose-500"
                                                    title="Delete Promo Code"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

