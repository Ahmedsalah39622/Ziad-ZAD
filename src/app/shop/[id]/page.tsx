import { getProductById } from "@/lib/actions/product-actions";
import { Nav } from "@/components/hero/nav";
import { Footer } from "@/components/footer/footer";
import Link from "next/link";
import { ProductDetailsClient } from "@/components/shop/product-details-client";

export default async function ProductPage({ params }: { params: { id: string } }) {
    const productData = await getProductById(params.id);

    if (!productData) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
                    <Link href="/shop" className="text-neutral-400 hover:text-white underline underline-offset-4">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    // Parse JSON data from DB
    const product = {
        ...productData,
        priceDisplay: `L.E ${productData.price}`,
        details: JSON.parse(productData.details),
        images: JSON.parse(productData.images),
        sizes: JSON.parse(productData.sizes),
        colors: JSON.parse(productData.colors),
        category: productData.category?.name || "Uncategorized"
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                <Nav variant="transparent" />
            </div>

            <div className="pt-20">
                <ProductDetailsClient product={product} />
            </div>

            <Footer />
        </div>
    );
}
