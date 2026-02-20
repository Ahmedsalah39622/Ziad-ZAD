"use client";

import { ProductCard } from "@/components/shop/product-card";
import { products } from "@/lib/products";

export function ShopGrid() {
    return (
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-4 pb-24">
            {/* Item Count */}
            <div className="flex items-center gap-3 mb-8">
                <span className="text-neutral-600 text-xs font-mono tracking-wider">{products.length} Items</span>
                <div className="flex-1 h-px bg-neutral-900" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
