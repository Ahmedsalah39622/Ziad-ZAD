import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// Removed explicit Product type to allow pre-parsed data through props without type mismatch during refactors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductCard({ product }: { product: any }) {
    const isOutOfStock = product.stock <= 0;

    return (
        <Link
            href={`/shop/${product.id}`}
            className={`group relative flex flex-col cursor-pointer ${isOutOfStock ? "pointer-events-none" : ""}`}
        >
            {/* Image Container */}
            <div className="aspect-[3/4] w-full overflow-hidden bg-secondary relative">

                {product.discountRibbon && product.compareAtPrice && product.compareAtPrice > product.price ? (
                    <Badge
                        className="absolute top-4 left-4 z-20 font-bold uppercase text-[10px] tracking-widest rounded-none px-3 py-1 shadow-md shadow-black/20"
                        style={{ backgroundColor: product.discountRibbon.color, color: "#ffffff" }}
                    >
                        {product.discountRibbon.text}
                    </Badge>
                ) : product.tag && !isOutOfStock ? (
                    <Badge className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-none px-3 py-1">
                        {product.tag}
                    </Badge>
                ) : null}

                {isOutOfStock && (
                    <Badge className="absolute top-4 left-4 z-20 bg-rose-600 text-background font-bold uppercase text-[10px] tracking-widest rounded-none px-3 py-1">
                        Out of Stock
                    </Badge>
                )}
                {isOutOfStock && (
                    <Badge className="absolute top-4 left-4 z-20 bg-rose-600 text-background font-bold uppercase text-[10px] tracking-widest rounded-none px-3 py-1">
                        Out of Stock
                    </Badge>
                )}

                {/* Product Image */}
                <div className="absolute inset-0">
                    {product.image && product.image !== "" ? (
                        <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-[800ms] ease-out">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-bold text-xs tracking-[0.2em] uppercase group-hover:scale-110 transition-transform duration-[800ms] ease-out">
                            {product.name}
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-foreground/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60" />
                )}

                {/* Arrow Icon on Hover */}
                <div className="absolute bottom-4 right-4 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                        <ArrowUpRight className="w-4 h-4 text-foreground" />
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex justify-between items-start pt-6 pb-2">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">
                        {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mt-2 tracking-widest uppercase">{product.category}</p>
                </div>
                <p className="text-xl md:text-2xl font-black text-foreground tabular-nums">{product.priceDisplay}</p>
            </div>

            {/* Color Swatches */}
            {product.colors && (
                <div className="flex gap-2 mt-2">
                    {product.colors.map((color: { hex: string }, i: number) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-foreground/10 transition-transform duration-200 hover:scale-125"
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            )}

            {/* Bottom accent line */}
            <div className="w-0 group-hover:w-full h-px bg-gradient-to-r from-foreground/40 to-transparent transition-all duration-500 mt-3" />
        </Link>
    );
}
