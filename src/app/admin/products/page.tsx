import { getProducts } from "@/lib/actions/product-actions";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter">Products</h1>
                    <p className="text-zinc-500">Manage your product catalog.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-zinc-950 p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                        placeholder="Search products..."
                        className="border-white/10 bg-zinc-900 pl-10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                    />
                </div>
                <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900">
                    Filter
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="border-b border-white/10 bg-zinc-900/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-zinc-600 italic">No products found.</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded border border-white/10 bg-zinc-900 overflow-hidden flex items-center justify-center text-zinc-700">
                                                {(() => {
                                                    try {
                                                        const images = JSON.parse(product.images);
                                                        if (images && images.length > 0 && images[0].url) {
                                                            return <img src={images[0].url} alt={product.name} className="h-full w-full object-cover" />;
                                                        }
                                                    } catch (e) { }
                                                    return <Package className="h-5 w-5" />;
                                                })()}
                                            </div>
                                            <span className="font-medium text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{(product.category as any)?.name || "Uncategorized"}</td>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${product.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {product.active ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <DeleteProductButton id={product.id} name={product.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
