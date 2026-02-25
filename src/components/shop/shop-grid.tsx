"use client";

import { ProductCard } from "@/components/shop/product-card";

interface ShopGridProps {
    initialProducts: any[];
}

export function ShopGrid({ initialProducts }: ShopGridProps) {
    // Data is already parsed on the server
    const products = initialProducts.map(p => ({
        ...p,
        image: p.images?.[0]?.url || "",
        priceDisplay: `L.E ${p.price}`,
        category: p.categoryName || "Streetwear"
    }));

    return (
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-4 pb-24">
            <div className="flex items-center gap-3 mb-8">
                <span className="text-neutral-600 text-xs font-mono tracking-wider">{products.length} Items</span>
                <div className="flex-1 h-px bg-neutral-900" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
