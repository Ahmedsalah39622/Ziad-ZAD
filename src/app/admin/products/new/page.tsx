export const dynamic = 'force-dynamic';

import { getCategories } from "@/lib/actions/category-actions";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
    const categories = await getCategories();

    return (
        <div className="max-w-6xl mx-auto">
            <ProductForm categories={categories} />
        </div>
    );
}
