"use client";

import { Nav } from "@/components/hero/nav";
import { Footer } from "@/components/footer/footer";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
    const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();

    return (
        <div className="bg-background min-h-screen text-foreground">
            {/* Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl">
                <Nav />
            </div>

            <div className="pt-20 px-6 md:px-12 max-w-5xl mx-auto min-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between py-8 border-b border-border">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                            Your Cart
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 font-mono tracking-wider">
                            {totalItems} {totalItems === 1 ? "Item" : "Items"}
                        </p>
                    </div>
                    <Link href="/shop" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    /* Empty Cart */
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <ShoppingBag className="w-16 h-16 text-muted" />
                        <h2 className="text-2xl font-bold text-muted-foreground">Your cart is empty</h2>
                        <Link
                            href="/shop"
                            className="bg-primary text-primary-foreground px-8 h-12 flex items-center font-bold tracking-widest uppercase text-xs hover:opacity-90 transition-colors"
                        >
                            Browse Collection
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="divide-y divide-border">
                            {items.map((item) => (
                                <div
                                    key={`${item.product.id}-${item.size}-${item.color}`}
                                    className="flex gap-6 py-8"
                                >
                                    {/* Product Image */}
                                    <div className="h-20 w-20 relative rounded-lg bg-secondary overflow-hidden border border-border">
                                        {item.product.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                                {item.product.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/shop/${item.product.id}`} className="hover:underline underline-offset-4">
                                                <h3 className="font-bold text-foreground text-base md:text-lg tracking-wide uppercase">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-muted-foreground text-xs mt-1 tracking-wider">
                                                {item.color} / {item.size}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-border">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 h-10 flex items-center justify-center text-xs font-bold border-x border-border">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="text-foreground font-bold tabular-nums">
                                                    L.E {(item.product.price * item.quantity).toLocaleString('en-US')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="border-t border-border py-8 mt-4">
                            <div className="flex flex-col gap-4 max-w-sm ml-auto">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">L.E {totalPrice.toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-muted-foreground text-xs">Calculated at checkout</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between">
                                    <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                                    <span className="text-xl font-black">L.E {totalPrice.toLocaleString('en-US')}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full h-14 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm flex items-center justify-center hover:opacity-90 transition-colors mt-4"
                                >
                                    Proceed to Checkout
                                </Link>

                                <button
                                    onClick={clearCart}
                                    className="text-muted-foreground hover:text-destructive text-xs tracking-wider uppercase text-center transition-colors mt-2"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
