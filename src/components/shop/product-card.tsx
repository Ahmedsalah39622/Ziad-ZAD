import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/shop/${product.id}`} className="group relative flex flex-col cursor-pointer">
            {/* Image Container */}
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#111] relative">

                {product.tag && (
                    <Badge className="absolute top-4 left-4 z-20 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-none px-3 py-1">
                        {product.tag}
                    </Badge>
                )}

                {/* Product Image */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    {product.image && product.image !== "" ? (
                        <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-[800ms] ease-out">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold text-xs tracking-[0.2em] uppercase group-hover:scale-110 transition-transform duration-[800ms] ease-out">
                            {product.name}
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Arrow Icon on Hover */}
                <div className="absolute bottom-4 right-4 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex justify-between items-start pt-4 pb-1">
                <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                        {product.name}
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium mt-1 tracking-wider">{product.category}</p>
                </div>
                <p className="text-sm font-bold text-neutral-300 tabular-nums">{product.priceDisplay}</p>
            </div>

            {/* Color Swatches */}
            {product.colors && (
                <div className="flex gap-2 mt-2">
                    {product.colors.map((color, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-white/10 transition-transform duration-200 hover:scale-125"
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            )}

            {/* Bottom accent line */}
            <div className="w-0 group-hover:w-full h-px bg-gradient-to-r from-white/40 to-transparent transition-all duration-500 mt-3" />
        </Link>
    );
}
