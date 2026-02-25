import { getCategories } from "@/lib/actions/category-actions";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter">Categories</h1>
                    <p className="text-zinc-500">Organize your store catalog into sections.</p>
                </div>
                <Button className="bg-white text-black hover:bg-zinc-200">
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="border-b border-white/10 bg-zinc-900/50 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Products</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-zinc-600 italic">No categories found.</td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                                    <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{cat.slug}</td>
                                    <td className="px-6 py-4 text-zinc-400">{(cat as any)._count?.products || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500/70 hover:text-rose-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
