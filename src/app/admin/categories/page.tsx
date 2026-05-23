export const dynamic = 'force-dynamic';

import { createCategory, deleteCategory, getCategories, updateCategory } from "@/lib/actions/category-actions";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default async function CategoriesPage() {
    async function handleCreateCategory(formData: FormData) {
        "use server";
        const name = String(formData.get("name") || "").trim();
        const rawSlug = String(formData.get("slug") || "").trim();
        const slug = toSlug(rawSlug || name);

        if (!name) throw new Error("Category name is required");
        if (!slug) throw new Error("Category slug is required");

        await createCategory({ name, slug });
        revalidatePath("/admin/categories");
    }

    async function handleUpdateCategory(formData: FormData) {
        "use server";
        const id = String(formData.get("id") || "");
        const name = String(formData.get("name") || "").trim();
        const rawSlug = String(formData.get("slug") || "").trim();
        const slug = toSlug(rawSlug || name);

        if (!id) throw new Error("Category id is required");
        if (!name) throw new Error("Category name is required");
        if (!slug) throw new Error("Category slug is required");

        await updateCategory(id, { name, slug });
        revalidatePath("/admin/categories");
    }

    async function handleDeleteCategory(formData: FormData) {
        "use server";
        const id = String(formData.get("id") || "");
        if (!id) throw new Error("Category id is required");

        await deleteCategory(id);
        revalidatePath("/admin/categories");
    }

    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter">Categories</h1>
                    <p className="text-muted-foreground">Organize your store catalog into sections.</p>
                </div>
                <form action={handleCreateCategory} className="flex flex-wrap items-center gap-2">
                    <input
                        name="name"
                        placeholder="Category name"
                        required
                        className="h-10 min-w-[170px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                    <input
                        name="slug"
                        placeholder="slug"
                        className="h-10 min-w-[150px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                    <Button type="submit" className="bg-primary text-primary-foreground hover:opacity-90">
                        <Plus className="mr-2 h-4 w-4" />
                        New Category
                    </Button>
                </form>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-left text-sm text-foreground">
                    <thead className="border-b border-border bg-foreground/5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Products</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground/40 italic">No categories found.</td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                // Prevent deletion when category still has products
                                (() => {
                                    const productCount = cat._count?.products || 0;
                                    const canDelete = productCount === 0;
                                    return (
                                <tr key={cat.id} className="hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        <input
                                            form={`update-category-${cat.id}`}
                                            name="name"
                                            defaultValue={cat.name}
                                            required
                                            className="h-9 w-full max-w-[240px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground/40 text-xs">
                                        <input
                                            form={`update-category-${cat.id}`}
                                            name="slug"
                                            defaultValue={cat.slug}
                                            required
                                            className="h-9 w-full max-w-[220px] rounded-md border border-border bg-background px-3 text-sm font-mono text-foreground outline-none focus:border-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{productCount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <form id={`update-category-${cat.id}`} action={handleUpdateCategory}>
                                                <input type="hidden" name="id" value={cat.id} />
                                                <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Save">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </form>
                                            <form action={handleDeleteCategory}>
                                                <input type="hidden" name="id" value={cat.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={!canDelete}
                                                    className="h-8 w-8 text-rose-500/70 hover:text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={canDelete ? "Delete" : "Cannot delete: category has products"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                    );
                                })()
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
