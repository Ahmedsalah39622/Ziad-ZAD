"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The Product type expected by this component
export interface FeaturedProduct {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    images: string; // JSON string from DB
    image?: string; // Parsed fallback
}

interface FeaturedCategoryProps {
    title: string;
    products: FeaturedProduct[];
    viewAllLink?: string;
}

export function FeaturedCategory({ title, products, viewAllLink = "/shop" }: FeaturedCategoryProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [maxIndex, setMaxIndex] = useState(0);

    // Parse product images safely
    const parsedProducts = products.map((product) => {
        let coverImage = product.image || "";
        try {
            if (!coverImage && product.images) {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    coverImage = parsed[0].url || parsed[0] || "";
                }
            }
        } catch {
            // Ignore parse errors
        }
        return {
            ...product,
            coverImage,
        };
    });

    // Calculate visible items based on container width to update max index and current page properly
    useEffect(() => {
        const updateMaxIndex = () => {
            if (scrollContainerRef.current) {
                // approximate item width including gap
                const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 300;
                const visibleItems = Math.floor(scrollContainerRef.current.clientWidth / itemWidth) || 1;
                setMaxIndex(Math.max(0, parsedProducts.length - visibleItems));
            }
        };

        updateMaxIndex();
        window.addEventListener("resize", updateMaxIndex);
        return () => window.removeEventListener("resize", updateMaxIndex);
    }, [parsedProducts.length]);

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;
        const safeIndex = Math.max(0, Math.min(index, maxIndex));

        const child = scrollContainerRef.current.children[safeIndex] as HTMLElement;
        if (child) {
            scrollContainerRef.current.scrollTo({
                left: child.offsetLeft,
                behavior: "smooth"
            });
            setCurrentIndex(safeIndex);
        }
    };

    const scrollPrev = () => scrollToIndex(currentIndex - 1);
    const scrollNext = () => scrollToIndex(currentIndex + 1);

    // Function to format price
    const formatPrice = (price: number) => {
        return `LE ${price.toFixed(2)} EGP`;
    };

    if (!parsedProducts || parsedProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-white w-full border-b border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
                {/* Header */}
                <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest mb-6 md:mb-8">
                    {title}
                </h2>

                {/* Carousel Container */}
                <div className="relative group">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                        style={{
                            scrollbarWidth: "none", // Firefox
                            msOverflowStyle: "none" // IE 10+
                        }}
                    >
                        {/* 
              Tailwind utility for hiding scrollbar if not in global: 
              [&::-webkit-scrollbar]:hidden 
            */}
                        {parsedProducts.map((product) => {
                            const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

                            return (
                                <div
                                    key={product.id}
                                    className="w-[50vw] sm:w-[35vw] md:w-[25vw] lg:w-[20vw] xl:w-[15vw] snap-start flex-shrink-0 flex flex-col group cursor-pointer"
                                >
                                    <Link href={`/shop/${product.id}`} className="block relative w-full aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                                        {product.coverImage ? (
                                            <Image
                                                src={product.coverImage}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 640px) 70vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 font-medium">No Image</div>
                                        )}

                                        {/* Sale Pill */}
                                        {isOnSale && (
                                            <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-sm z-10 uppercase tracking-wide">
                                                Sale
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex flex-col flex-grow text-center items-center">
                                        <div className="flex flex-col items-center justify-center gap-1 mb-4 w-full px-2">
                                            <Link href={`/shop/${product.id}`} className="w-full">
                                                <h3 className="text-base md:text-lg lg:text-xl font-black text-foreground uppercase tracking-tight line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {isOnSale ? (
                                                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-1 sm:gap-2 mt-1">
                                                    <span className="text-[11px] md:text-xs text-gray-500 line-through font-bold">
                                                        {formatPrice(product.compareAtPrice!)}
                                                    </span>
                                                    <span className="text-base md:text-lg lg:text-xl font-black text-foreground tabular-nums">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-base md:text-lg lg:text-xl font-black text-foreground tabular-nums block mt-1">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            href={`/shop/${product.id}`}
                                            className="w-full text-center border border-gray-900 text-gray-900 py-3 text-xs md:text-sm font-semibold uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300"
                                        >
                                            Choose options
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Footer Navigation (Arrows & View All) */}
                <div className="mt-10 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-6 text-gray-500 mb-6 font-medium text-xs tracking-widest">
                        <button
                            onClick={scrollPrev}
                            disabled={currentIndex === 0}
                            className={`p-2 transition-colors ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-black cursor-pointer'}`}
                            aria-label="Previous items"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="tabular-nums">
                            {currentIndex + 1} / {parsedProducts.length}
                        </span>
                        <button
                            onClick={scrollNext}
                            disabled={currentIndex >= maxIndex}
                            className={`p-2 transition-colors ${currentIndex >= maxIndex ? 'opacity-30 cursor-not-allowed' : 'hover:text-black cursor-pointer'}`}
                            aria-label="Next items"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        href={viewAllLink}
                        className="bg-[#111] text-white px-10 py-3.5 text-sm font-bold tracking-wider hover:bg-black transition-colors min-w-[180px] text-center"
                    >
                        View all
                    </Link>
                </div>
            </div>

            {/* Helper style for hiding scrollbar globally since it's hard to target via pseudo in arbitrary util */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
        </section>
    );
}
