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
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            {/* Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                <Nav variant="transparent" />
            </div>

            <div className="pt-20 px-6 md:px-12 max-w-5xl mx-auto min-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between py-8 border-b border-neutral-900">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                            Your Cart
                        </h1>
                        <p className="text-neutral-500 text-sm mt-2 font-mono tracking-wider">
                            {totalItems} {totalItems === 1 ? "Item" : "Items"}
                        </p>
                    </div>
                    <Link href="/shop" className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    /* Empty Cart */
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <ShoppingBag className="w-16 h-16 text-neutral-800" />
                        <h2 className="text-2xl font-bold text-neutral-500">Your cart is empty</h2>
                        <Link
                            href="/shop"
                            className="bg-white text-black px-8 h-12 flex items-center font-bold tracking-widest uppercase text-xs hover:bg-neutral-200 transition-colors"
                        >
                            Browse Collection
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="divide-y divide-neutral-900">
                            {items.map((item) => (
                                <div
                                    key={`${item.product.id}-${item.size}-${item.color}`}
                                    className="flex gap-6 py-8"
                                >
                                    {/* Product Image */}
                                    <div className="h-20 w-20 relative rounded-lg bg-zinc-900 overflow-hidden border border-white/5">
                                        {item.product.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs font-bold tracking-wider uppercase">
                                                {item.product.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/shop/${item.product.id}`} className="hover:underline underline-offset-4">
                                                <h3 className="font-bold text-white text-base md:text-lg tracking-wide uppercase">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-neutral-500 text-xs mt-1 tracking-wider">
                                                {item.color} / {item.size}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-neutral-800">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 h-10 flex items-center justify-center text-xs font-bold border-x border-neutral-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                                                    className="text-neutral-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="text-white font-bold tabular-nums">
                                                    L.E {(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="border-t border-neutral-800 py-8 mt-4">
                            <div className="flex flex-col gap-4 max-w-sm ml-auto">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="font-bold">L.E {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Shipping</span>
                                    <span className="text-neutral-400 text-xs">Calculated at checkout</span>
                                </div>
                                <div className="h-px bg-neutral-800 my-2" />
                                <div className="flex justify-between">
                                    <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                                    <span className="text-xl font-black">L.E {totalPrice.toLocaleString()}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full h-14 bg-white text-black font-bold tracking-widest uppercase text-sm flex items-center justify-center hover:bg-neutral-200 transition-colors mt-4"
                                >
                                    Proceed to Checkout
                                </Link>

                                <button
                                    onClick={clearCart}
                                    className="text-neutral-600 hover:text-red-500 text-xs tracking-wider uppercase text-center transition-colors mt-2"
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
