import { Nav } from "@/components/hero/nav";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ShopGrid } from "@/components/shop/shop-grid";
import { Footer } from "@/components/footer/footer";
import type { Metadata } from "next";
import { getProducts } from "@/lib/actions/product-actions";

export const metadata: Metadata = {
    title: "ZAD - Shop Collection 001",
    description: "Premium streetwear engineered with nanobana special effects.",
};

export default async function ShopPage() {
    const rawProducts = await getProducts();

    // Parse JSON data on the server for stable hydration
    const products = rawProducts.map(p => {
        const parsedImages = JSON.parse(p.images || "[]");
        return {
            ...p,
            images: parsedImages.length > 0 ? [parsedImages[0]] : [],
            colors: JSON.parse(p.colors || "[]"),
            sizes: JSON.parse(p.sizes || "[]"),
            details: [], // Do not send rich text details to the grid
            categoryName: p.category?.name || "Streetwear",
            stock: p.stock,
        };
    });

    return (
        <div className="bg-background min-h-screen w-full flex flex-col text-foreground">
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl">
                <Nav variant="transparent" />
            </div>

            <div className="relative w-full pt-32 pb-10 px-6 md:px-12">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex flex-col gap-2">
                        <div className="overflow-hidden">
                            <h1 className="text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.85] text-foreground">
                                The
                            </h1>
                        </div>
                        <div className="overflow-hidden flex items-baseline gap-4 md:gap-8">
                            <h1 className="text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground to-foreground">
                                Collection
                            </h1>
                            <span className="text-muted-foreground/40 text-lg md:text-2xl font-mono tracking-tight">
                                /001
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-8 md:mt-12 gap-6">
                        <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
                            Premium streetwear engineered for those who refuse to blend in.
                            Every piece is built for movement, designed for impact.
                        </p>
                        <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground/40 tracking-wider uppercase">
                            <span>Genesis Edition</span>
                            <span className="w-8 h-px bg-border" />
                            <span>2026</span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mt-10" />
                </div>
            </div>

            <ShopFilters />

            <ShopGrid initialProducts={products} />

            <Footer />
        </div>
    );
}
