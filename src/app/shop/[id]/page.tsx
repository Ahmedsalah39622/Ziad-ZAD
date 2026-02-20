"use client";

import { Nav } from "@/components/hero/nav";
import { Footer } from "@/components/footer/footer";
import { useCart } from "@/lib/cart-context";
import { getProductById } from "@/lib/products";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { addItem, totalItems } = useCart();
    const product = getProductById(params.id as string);

    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    if (!product) {
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

    const handleAddToCart = () => {
        if (!selectedSize) return;
        for (let i = 0; i < quantity; i++) {
            addItem(product, selectedSize, product.colors[selectedColor].name);
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            {/* Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                <Nav variant="transparent" />
            </div>

            <div className="pt-20 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-4 py-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span className="text-neutral-800">/</span>
                    <Link href="/shop" className="text-neutral-500 hover:text-white transition-colors text-sm">Shop</Link>
                    <span className="text-neutral-800">/</span>
                    <span className="text-neutral-300 text-sm">{product.name}</span>
                </div>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pb-20">
                    {/* Image Column */}
                    <div className="aspect-[4/5] bg-[#111] relative overflow-hidden">
                        {product.tag && (
                            <span className="absolute top-6 left-6 z-10 bg-white text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                                {product.tag}
                            </span>
                        )}
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain p-12"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold text-sm tracking-[0.2em] uppercase">
                                {product.name}
                            </div>
                        )}
                    </div>

                    {/* Details Column */}
                    <div className="flex flex-col gap-8 lg:py-4">
                        {/* Title & Price */}
                        <div>
                            <p className="text-xs font-mono text-neutral-600 tracking-wider uppercase mb-3">
                                {product.category}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-4">
                                {product.name}
                            </h1>
                            <p className="text-2xl font-bold text-white">{product.priceDisplay}</p>
                        </div>

                        {/* Description */}
                        <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                            {product.description}
                        </p>

                        {/* Color Selection */}
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-4">
                                Color — {product.colors[selectedColor].name}
                            </p>
                            <div className="flex gap-3">
                                {product.colors.map((color, i) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(i)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${selectedColor === i ? "border-white scale-110" : "border-white/10 hover:border-white/30"}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-4">
                                Size {selectedSize && `— ${selectedSize}`}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[52px] h-12 px-4 border text-sm font-bold tracking-wider uppercase transition-all duration-200 ${selectedSize === size
                                            ? "bg-white text-black border-white"
                                            : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-4">
                                Quantity
                            </p>
                            <div className="flex items-center border border-neutral-800 w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 h-12 flex items-center justify-center text-sm font-bold border-x border-neutral-800">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                            className={`w-full h-14 font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all duration-300 ${added
                                ? "bg-emerald-600 text-white"
                                : selectedSize
                                    ? "bg-white text-black hover:bg-neutral-200"
                                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                }`}
                        >
                            {added ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    {selectedSize ? "Add to Cart" : "Select a Size"}
                                </>
                            )}
                        </button>

                        {/* View Cart Link */}
                        {totalItems > 0 && (
                            <Link
                                href="/cart"
                                className="text-center text-sm text-neutral-500 hover:text-white underline underline-offset-4 transition-colors"
                            >
                                View Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                            </Link>
                        )}

                        {/* Product Details */}
                        <div className="border-t border-neutral-900 pt-8">
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-4">
                                Details
                            </p>
                            <ul className="space-y-3">
                                {product.details.map((detail, i) => (
                                    <li key={i} className="text-sm text-neutral-400 flex items-center gap-3">
                                        <span className="w-1 h-1 bg-neutral-600 rounded-full shrink-0" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
