import { getProducts, updateProductPrices } from "@/lib/actions/product-actions";
import { getSetting, setSetting } from "@/lib/actions/settings-actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { BadgePercent, Palette, Package, Sparkles } from "lucide-react";

export const metadata = {
    title: "Product Discounts - Admin",
};

// ISR: Revalidate every 1 minute
export const revalidate = 60;

function formatDiscountDisplayPrice(value: number) {
    return `LE ${value.toFixed(2)} EGP`;
}

export default async function ProductDiscountsPage() {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
        redirect("/");
    }

    const products = await getProducts();

    async function handleUpdate(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        const price = parseFloat(formData.get("price") as string);
        const compareAtPriceRaw = formData.get("compareAtPrice") as string;
        const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;

        const ribbonText = formData.get("ribbonText") as string;
        const ribbonColor = formData.get("ribbonColor") as string;

        await updateProductPrices(id, price, compareAtPrice);

        // Update custom ribbon settings
        const currentSettingsRaw = await getSetting("product_discount_ribbons", "{}");
        const currentSettings = JSON.parse(currentSettingsRaw);

        if (ribbonText) {
            currentSettings[id] = { text: ribbonText, color: ribbonColor || "#ef4444" };
        } else {
            // Remove the ribbon if text is cleared
            delete currentSettings[id];
        }

        await setSetting("product_discount_ribbons", JSON.stringify(currentSettings));

        revalidatePath("/admin/product-discounts");
        revalidatePath("/shop");
        revalidatePath("/");
    }

    const ribbonSettingsRaw = await getSetting("product_discount_ribbons", "{}");
    const ribbonSettings = JSON.parse(ribbonSettingsRaw) as Record<string, { text?: string; color?: string }>;

    const totalProducts = products.length;
    const onSaleProducts = products.filter((product) => product.compareAtPrice && product.compareAtPrice > product.price).length;
    const ribbonedProducts = products.filter((product) => ribbonSettings[product.id]?.text).length;
    const averageDiscount = onSaleProducts
        ? Math.round(
            products
                .filter((product) => product.compareAtPrice && product.compareAtPrice > product.price)
                .reduce((sum, product) => {
                    const compareAt = product.compareAtPrice || 0;
                    const price = product.price || 0;
                    return sum + (compareAt > 0 ? ((compareAt - price) / compareAt) * 100 : 0);
                }, 0) / onSaleProducts
        )
        : 0;

    return (
        <div className="space-y-8 pb-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-7 shadow-[0_20px_70px_rgba(0,0,0,0.08)] md:px-8">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent" />
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-primary" />
                            Pricing Studio
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Product Discounts & Sales</h1>
                            <p className="mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-7">
                                Set a compare-at price to create a sale, add a ribbon, and keep the store experience consistent across shop pages.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                        <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Products</p>
                            <div className="mt-2 flex items-center gap-2 text-xl font-black">
                                <Package className="h-4 w-4 text-foreground" />
                                {totalProducts}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">On Sale</p>
                            <div className="mt-2 flex items-center gap-2 text-xl font-black text-emerald-500">
                                <BadgePercent className="h-4 w-4" />
                                {onSaleProducts}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Ribbons</p>
                            <div className="mt-2 flex items-center gap-2 text-xl font-black text-foreground">
                                <Palette className="h-4 w-4" />
                                {ribbonedProducts}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Avg. Discount</p>
                            <div className="mt-2 text-xl font-black text-foreground">{averageDiscount}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <div className="border-b border-border bg-foreground/[0.03] px-6 py-4 md:px-8">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Sale Controls</h2>
                            <p className="text-sm text-muted-foreground mt-1">Edit prices, ribbons, and visual labels inline. Save per product.</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Tip: leave ribbon text empty to remove it</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm text-foreground">
                    <thead className="border-b border-border bg-foreground/[0.04] text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 md:px-8">Product</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Compare At</th>
                            <th className="px-6 py-4">Sale Price</th>
                            <th className="px-6 py-4">Ribbon</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 text-sm">
                        {products.map((product) => {
                            let imgUrl = "";
                            try {
                                const parsed = JSON.parse(product.images || "[]");
                                if (parsed.length > 0) imgUrl = parsed[0].url;
                            } catch { }

                            const isOnSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
                            const ribbon = ribbonSettings[product.id];
                            const formattedSalePrice = formatDiscountDisplayPrice(product.price);
                            const formattedCompareAtPrice = product.compareAtPrice
                                ? formatDiscountDisplayPrice(product.compareAtPrice)
                                : null;

                            return (
                                <tr key={product.id} className="group transition-colors hover:bg-foreground/[0.03]">
                                    <td className="px-6 py-5 md:px-8">
                                        <div className="flex items-center gap-4">
                                            {imgUrl ? (
                                                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                                                    <Image src={imgUrl} alt={product.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground/40 shadow-sm">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="truncate font-black uppercase tracking-tight">{product.name}</div>
                                                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{product.category?.name || "Uncategorized"}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        {isOnSale ? (
                                            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-500">On Sale</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">Normal</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-5 align-top">
                                        <form action={handleUpdate} className="flex flex-wrap items-center gap-3 lg:gap-4">
                                            <input type="hidden" name="id" value={product.id} />

                                            <div className="w-full flex items-center gap-2">
                                                {formattedCompareAtPrice && isOnSale ? (
                                                    <span className="text-sm font-medium text-muted-foreground line-through tabular-nums">
                                                        {formattedCompareAtPrice}
                                                    </span>
                                                ) : null}
                                                <span className="text-3xl leading-none font-black tracking-tight text-foreground tabular-nums">
                                                    {formattedSalePrice}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">L.E</span>
                                                <input
                                                    type="number"
                                                    name="compareAtPrice"
                                                    defaultValue={product.compareAtPrice || ""}
                                                    placeholder="Original"
                                                    step="0.01"
                                                    className="w-28 border-0 bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground line-through outline-none focus:ring-0"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 shadow-sm">
                                                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">L.E</span>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    defaultValue={product.price}
                                                    step="0.01"
                                                    required
                                                    className="w-28 border-0 bg-transparent px-0 py-0 text-sm font-black text-emerald-600 outline-none focus:ring-0"
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                                                <input
                                                    type="text"
                                                    name="ribbonText"
                                                    defaultValue={ribbon?.text || ""}
                                                    placeholder="Ribbon text"
                                                    className="w-32 border-0 bg-transparent px-0 py-0 text-sm outline-none placeholder:text-muted-foreground/40 focus:ring-0"
                                                />
                                                <input
                                                    type="color"
                                                    name="ribbonColor"
                                                    defaultValue={ribbon?.color || "#ef4444"}
                                                    className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-border p-0"
                                                    title="Ribbon Color"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="ml-auto inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-90 opacity-0 group-hover:opacity-100"
                                            >
                                                Save
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-14 text-center text-muted-foreground">
                                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-foreground/[0.02] px-6 py-10">
                                        <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
                                        <p className="mt-4 text-sm font-black uppercase tracking-[0.25em] text-foreground">No products found</p>
                                        <p className="mt-2 text-sm text-muted-foreground">Add products first, then use this screen to set sale prices and ribbons.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
