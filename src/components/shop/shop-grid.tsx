"use client";

import { ProductCard } from "@/components/shop/product-card";

interface ShopGridProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialProducts: any[];
}

export function ShopGrid({ initialProducts }: ShopGridProps) {
    const products = initialProducts.map(p => ({
        ...p,
        image: p.images?.[0]?.url || "",
        priceDisplay: `L.E ${p.price}`,
        compareAtPrice: p.compareAtPrice,
        category: p.categoryName || "Streetwear"
    }));

    return (
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-4 pb-24">
            <div className="w-full flex items-center gap-3 mb-8">
                <span className="text-muted-foreground text-xs font-mono tracking-wider">{products.length} Items</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-12 lg:gap-16">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
