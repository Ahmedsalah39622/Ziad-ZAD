"use client";

import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductDetailsClientProps {
    product: any;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
    const router = useRouter();
    const { addItem, totalItems } = useCart();

    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Main image state
    const [mainImageIndex, setMainImageIndex] = useState(0);

    // Filter images by color or show all
    const images = product.images || [];
    const colors = product.colors || [];

    // When color changes, try to find an associated image
    useEffect(() => {
        const selectedColor = colors[selectedColorIndex];
        if (selectedColor) {
            const associatedImageIndex = images.findIndex((img: any) => img.color === selectedColor.name);
            if (associatedImageIndex !== -1) {
                setMainImageIndex(associatedImageIndex);
            }
        }
    }, [selectedColorIndex, images, colors]);

    const handleAddToCart = () => {
        if (!selectedSize) return;

        // Use the currently displayed image for the cart
        const cartProduct = {
            ...product,
            image: images[mainImageIndex]?.url || images[0]?.url || ""
        };

        for (let i = 0; i < quantity; i++) {
            addItem(cartProduct, selectedSize, colors[selectedColorIndex]?.name);
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-20">
                {/* Image & Gallery Column */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] bg-zinc-900/50 relative overflow-hidden rounded-2xl border border-white/5">
                        {product.tag && (
                            <span className="absolute top-6 left-6 z-10 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                                {product.tag}
                            </span>
                        )}
                        {images.length > 0 ? (
                            <Image
                                src={images[mainImageIndex]?.url || ""}
                                alt={product.name}
                                fill
                                className="object-contain p-8 transition-all duration-700 ease-in-out"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold text-sm tracking-[0.2em] uppercase">
                                No Images Available
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-4">
                            {images.map((img: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setMainImageIndex(i)}
                                    className={`aspect-square relative rounded-xl overflow-hidden border-2 transition-all ${mainImageIndex === i ? "border-emerald-500 scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/5 hover:border-zinc-700"}`}
                                >
                                    <Image src={img.url} alt={`Thumbnail ${i}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Column */}
                <div className="flex flex-col gap-10">
                    {/* Title & Price */}
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase mb-4">
                            {product.category}
                        </p>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-6">
                            {product.name}
                        </h1>
                        <p className="text-3xl font-bold text-white/90">
                            {typeof product.price === 'number' ? `L.E ${product.price.toLocaleString()}` : product.price}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 leading-relaxed text-base">
                        {product.description}
                    </p>

                    <div className="space-y-8">
                        {/* Color Selection */}
                        {colors.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-4">
                                    Available Colors — <span className="text-white">{colors[selectedColorIndex]?.name}</span>
                                </p>
                                <div className="flex gap-4">
                                    {colors.map((color: any, i: number) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColorIndex(i)}
                                            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 relative group ${selectedColorIndex === i ? "border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "border-white/10 hover:border-white/30"}`}
                                            title={color.name}
                                        >
                                            <div
                                                className="absolute inset-1 rounded-full"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {selectedColorIndex === i && (
                                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-lg">
                                                    <Check className="w-2 h-2 text-black" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-4">
                                Select Size {selectedSize && <span className="text-white">— {selectedSize}</span>}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map((size: string) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[64px] h-14 px-6 border rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-300 ${selectedSize === size
                                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            : "border-white/5 text-zinc-500 hover:border-zinc-600 hover:text-white bg-zinc-900/30"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500">
                                Quantity
                            </p>
                            <div className="flex items-center bg-zinc-900/50 border border-white/5 rounded-2xl w-fit overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white transition-colors hover:bg-white/5"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 h-14 flex items-center justify-center text-lg font-black border-x border-white/5 px-6">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-14 h-14 flex items-center justify-center text-zinc-500 hover:text-white transition-colors hover:bg-white/5"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="pt-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                            className={`w-full h-16 rounded-2xl font-black tracking-[0.3em] uppercase text-xs flex items-center justify-center gap-4 transition-all duration-500 ${added
                                ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                : selectedSize
                                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                                    : "bg-zinc-900 text-zinc-600 cursor-not-allowed grayscale border border-white/5"
                                }`}
                        >
                            {added ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Successfully Added
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    {selectedSize ? "Secure Order" : "Select Size First"}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Product Details Points */}
                    {product.details.length > 0 && (
                        <div className="border-t border-white/5 pt-10">
                            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-6">
                                Technical Specifications
                            </p>
                            <ul className="grid gap-4">
                                {product.details.map((detail: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-4 group">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 group-hover:scale-150 transition-transform mt-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="group-hover:text-zinc-200 transition-colors">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
