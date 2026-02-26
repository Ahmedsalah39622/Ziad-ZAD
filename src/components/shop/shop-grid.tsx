"use client";

import { ProductCard } from "@/components/shop/product-card";

interface ShopGridProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                <span className="text-muted-foreground text-xs font-mono tracking-wider">{products.length} Items</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
