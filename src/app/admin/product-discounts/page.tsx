import { getProducts, updateProductPrices } from "@/lib/actions/product-actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";

export const metadata = {
    title: "Product Discounts - Admin",
};

export const dynamic = "force-dynamic";

export default async function ProductDiscountsPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    const products = await getProducts();

    async function handleUpdate(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        const price = parseFloat(formData.get("price") as string);
        const compareAtPriceRaw = formData.get("compareAtPrice") as string;
        const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;

        await updateProductPrices(id, price, compareAtPrice);
        revalidatePath("/admin/product-discounts");
        revalidatePath("/shop");
        revalidatePath("/");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Product Discounts & Sales</h1>
                <p className="text-muted-foreground mt-2">
                    Set a "Compare at Price" to put an item on sale. The item will show a discount badge, and the original price will be crossed out in the store.
                </p>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="border-b border-border bg-foreground/5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Compare At (Original)</th>
                            <th className="px-6 py-4">Sale Price (Active)</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5 text-sm">
                        {products.map((product) => {
                            let imgUrl = "";
                            try {
                                const parsed = JSON.parse(product.images || "[]");
                                if (parsed.length > 0) imgUrl = parsed[0].url;
                            } catch (e) { }

                            const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

                            return (
                                <tr key={product.id} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {imgUrl ? (
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                    <Image src={imgUrl} alt={product.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded-md" />
                                            )}
                                            <div className="font-bold">{product.name}</div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 font-bold">
                                        {isOnSale ? (
                                            <span className="text-emerald-500 uppercase text-[10px] tracking-widest px-2 py-1 bg-emerald-500/10 rounded-full">On Sale</span>
                                        ) : (
                                            <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Normal</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4" colSpan={3}>
                                        <form action={handleUpdate} className="flex items-center gap-4">
                                            <input type="hidden" name="id" value={product.id} />

                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">L.E</span>
                                                <input
                                                    type="number"
                                                    name="compareAtPrice"
                                                    defaultValue={product.compareAtPrice || ""}
                                                    placeholder="Original"
                                                    step="0.01"
                                                    className="w-24 border border-border bg-background rounded-md px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-muted-foreground line-through"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs">L.E</span>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    defaultValue={product.price}
                                                    step="0.01"
                                                    required
                                                    className="w-24 border border-border bg-background rounded-md px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-emerald-500"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest"
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
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    No products found. Add products first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
