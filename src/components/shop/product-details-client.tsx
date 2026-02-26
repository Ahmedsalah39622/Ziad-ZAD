"use client";

import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { DiagonalRibbon } from "@/components/ui/diagonal-ribbon";

interface ProductDetailsClientProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
    const router = useRouter();
    const { addItem } = useCart();

    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Main image state
    const [mainImageIndex, setMainImageIndex] = useState(0);

    const selectedSizeData = useMemo(() => {
        if (!selectedSize) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (product.sizes || []).find((s: any) =>
            (typeof s === 'object' ? s.name : s) === selectedSize
        );
    }, [selectedSize, product.sizes]);

    // Filter images by color or show all
    const images = useMemo(() => product.images || [], [product.images]);
    const colors = useMemo(() => product.colors || [], [product.colors]);

    // When color changes, try to find an associated image
    useEffect(() => {
        const selectedColor = colors[selectedColorIndex];
        if (selectedColor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const associatedImageIndex = images.findIndex((img: any) => img.color === selectedColor.name);
            if (associatedImageIndex !== -1) {
                setMainImageIndex(associatedImageIndex);
            }
        }
    }, [selectedColorIndex, images, colors]);

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error("Please select a size before ordering");
            return;
        }

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
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <span className="text-border">/</span>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Shop</Link>
                <span className="text-border">/</span>
                <span className="text-foreground text-sm">{product.name}</span>
            </div>

            {/* Product Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-20">
                {/* Image & Gallery Column */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] bg-secondary/50 relative overflow-hidden rounded-2xl border border-border">
                        {product.discountRibbon && product.compareAtPrice && product.compareAtPrice > product.price ? (
                            <DiagonalRibbon
                                text={product.discountRibbon.text}
                                color={product.discountRibbon.color}
                            />
                        ) : product.tag ? (
                            <span className="absolute top-6 left-6 z-10 bg-foreground text-background text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                                {product.tag}
                            </span>
                        ) : null}
                        {images.length > 0 ? (
                            <Image
                                src={images[mainImageIndex]?.url || ""}
                                alt={product.name}
                                fill
                                className="object-cover transition-all duration-700 ease-in-out"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-bold text-sm tracking-[0.2em] uppercase">
                                No Images Available
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {images.map((img: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setMainImageIndex(i)}
                                    className={`aspect-square relative rounded-xl overflow-hidden border-2 transition-all ${mainImageIndex === i ? "border-foreground scale-95 shadow-[0_0_15px_rgba(0,0,0,0.1)]" : "border-border hover:border-muted-foreground"}`}
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
                        <p className="text-[10px] font-black text-muted-foreground/60 tracking-[0.3em] uppercase mb-4">
                            {product.category}
                        </p>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-6">
                            {product.name}
                        </h1>
                        <p className="text-3xl font-bold text-foreground/90">
                            {typeof product.price === 'number' ? `L.E ${product.price.toLocaleString()}` : product.price}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-base">
                        {product.description}
                    </p>

                    <div className="space-y-8">
                        {/* Color Selection */}
                        {colors.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-4">
                                    Available Colors — <span className="text-foreground">{colors[selectedColorIndex]?.name}</span>
                                </p>
                                <div className="flex gap-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {colors.map((color: any, i: number) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColorIndex(i)}
                                            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 relative group ${selectedColorIndex === i ? "border-foreground scale-110 shadow-[0_0_20px_rgba(0,0,0,0.1)]" : "border-border hover:border-foreground/30"}`}
                                            title={color.name}
                                        >
                                            <div
                                                className="absolute inset-1 rounded-full"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {selectedColorIndex === i && (
                                                <div className="absolute -top-1 -right-1 bg-foreground rounded-full p-0.5 shadow-lg">
                                                    <Check className="w-2 h-2 text-background" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                                    Select Size {selectedSize && <span className="text-foreground">— {selectedSize}</span>}
                                </p>
                                {selectedSize && (
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSizeData && typeof selectedSizeData === 'object' && selectedSizeData.stock > 0
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                        }`}>
                                        {selectedSizeData && typeof selectedSizeData === 'object'
                                            ? (selectedSizeData.stock > 0 ? `${selectedSizeData.stock} units remaining` : "Out of Stock")
                                            : (product.stock > 0 ? `${product.stock} units remaining` : "Out of Stock")
                                        }
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {product.sizes.map((size: any) => {
                                    const sizeName = typeof size === 'object' ? size.name : size;
                                    const sizeStock = typeof size === 'object' ? size.stock : product.stock;
                                    const isOutOfStock = sizeStock <= 0;

                                    return (
                                        <button
                                            key={sizeName}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(sizeName)}
                                            className={`min-w-[64px] h-14 px-6 border rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-300 relative overflow-hidden ${selectedSize === sizeName
                                                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                                                : isOutOfStock
                                                    ? "border-border text-muted-foreground/30 bg-secondary/10 cursor-not-allowed"
                                                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground bg-secondary/30"
                                                }`}
                                        >
                                            {sizeName}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-[px] bg-red-500/30 rotate-45" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                                Quantity
                            </p>
                            <div className="flex items-center bg-secondary/50 border border-border rounded-2xl w-fit overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-14 h-14 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 h-14 flex items-center justify-center text-lg font-black border-x border-border px-6">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-14 h-14 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/5"
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
                            disabled={!selectedSize || (selectedSizeData && typeof selectedSizeData === 'object' && selectedSizeData.stock <= 0)}
                            className={`w-full h-16 rounded-2xl font-black tracking-[0.3em] uppercase text-xs flex items-center justify-center gap-4 transition-all duration-500 ${added
                                ? "bg-foreground text-background shadow-[0_0_30px_rgba(0,0,0,0.1)]"
                                : (selectedSize && (typeof selectedSizeData === 'object' ? selectedSizeData.stock > 0 : product.stock > 0))
                                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:-translate-y-1"
                                    : "bg-secondary text-muted-foreground cursor-pointer grayscale border border-border"
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
                                    {selectedSize
                                        ? (selectedSizeData && typeof selectedSizeData === 'object' && selectedSizeData.stock <= 0
                                            ? "Sold Out"
                                            : "Secure Order")
                                        : "Select Size First"
                                    }
                                </>
                            )}
                        </button>
                    </div>

                    {/* Product Details Points */}
                    {product.details.length > 0 && (
                        <div className="border-t border-border pt-10">
                            <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-6">
                                Technical Specifications
                            </p>
                            <ul className="grid gap-4">
                                {product.details.map((detail: string, i: number) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-4 group">
                                        <div className="w-1.5 h-1.5 bg-foreground rounded-full shrink-0 group-hover:scale-150 transition-transform mt-1.5 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                                        <span className="group-hover:text-foreground transition-colors">{detail}</span>
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
