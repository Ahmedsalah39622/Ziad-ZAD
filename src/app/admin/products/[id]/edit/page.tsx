import { getProductById } from "@/lib/actions/product-actions";
import { getCategories } from "@/lib/actions/category-actions";
import { ProductForm } from "@/components/admin/product-form";
import { redirect } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id);
    const categories = await getCategories();

    if (!product) {
        redirect("/admin/products");
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Edit Product</h1>
                <p className="text-zinc-500">Update details for {product.name}.</p>
            </div>

            <ProductForm categories={categories} initialData={product} />
        </div>
    );
}
