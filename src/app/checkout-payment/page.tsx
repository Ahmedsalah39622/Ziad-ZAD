"use client";

import { Nav } from "@/components/hero/nav";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Check, CreditCard } from "lucide-react";

export default function CheckoutPaymentPage() {
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        governorate: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
        paymentMethod: "cod" as "cod" | "card",
    });

    const shipping = totalPrice >= 1000 ? 0 : 60;
    const grandTotal = totalPrice + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate processing
        await new Promise((r) => setTimeout(r, 2000));
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
    };

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen text-white flex flex-col">
                <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                    <Nav variant="transparent" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-20">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Cart is Empty</h1>
                    <Link href="/shop" className="bg-white text-black px-8 h-12 flex items-center font-bold tracking-widest uppercase text-xs hover:bg-neutral-200 transition-colors">
                        Browse Collection
                    </Link>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen text-white flex flex-col">
                <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                    <Nav variant="transparent" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-20 px-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mb-4">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center">Order Confirmed</h1>
                    <p className="text-neutral-400 text-center max-w-md">
                        Thank you for your purchase! You&apos;ll receive an email confirmation shortly with your order details and tracking info.
                    </p>
                    <div className="text-2xl font-bold mt-2">L.E {grandTotal.toLocaleString()}</div>
                    <Link
                        href="/shop"
                        className="bg-white text-black px-8 h-12 flex items-center font-bold tracking-widest uppercase text-xs hover:bg-neutral-200 transition-colors mt-4"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white">
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                <Nav variant="transparent" />
            </div>

            <div className="pt-20 px-6 md:px-12 max-w-6xl mx-auto pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 py-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-10">
                    Checkout
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Left — Form */}
                        <div className="lg:col-span-3 flex flex-col gap-10">
                            {/* Contact */}
                            <div>
                                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6">
                                    Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        required
                                        placeholder="First Name"
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                    />
                                    <input
                                        required
                                        placeholder="Last Name"
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                    />
                                    <input
                                        required
                                        type="email"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                    />
                                    <input
                                        required
                                        placeholder="Phone Number"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                    />
                                </div>
                            </div>

                            {/* Shipping */}
                            <div>
                                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6">
                                    Shipping Address
                                </h2>
                                <div className="flex flex-col gap-4">
                                    <input
                                        required
                                        placeholder="Street Address"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            required
                                            placeholder="City"
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                        />
                                        <input
                                            required
                                            placeholder="Governorate"
                                            value={form.governorate}
                                            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                                            className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6">
                                    Payment Method
                                </h2>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, paymentMethod: "cod" })}
                                        className={`flex items-center gap-4 border h-14 px-5 transition-all duration-200 ${form.paymentMethod === "cod" ? "border-white bg-white/5" : "border-neutral-800 hover:border-neutral-600"
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === "cod" ? "border-white" : "border-neutral-600"}`}>
                                            {form.paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-sm font-bold tracking-wider uppercase">Cash on Delivery</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, paymentMethod: "card" })}
                                        className={`flex items-center gap-4 border h-14 px-5 transition-all duration-200 ${form.paymentMethod === "card" ? "border-white bg-white/5" : "border-neutral-800 hover:border-neutral-600"
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === "card" ? "border-white" : "border-neutral-600"}`}>
                                            {form.paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <CreditCard className="w-4 h-4 text-neutral-400" />
                                        <span className="text-sm font-bold tracking-wider uppercase">Credit / Debit Card</span>
                                    </button>
                                </div>

                                {form.paymentMethod === "card" && (
                                    <div className="mt-4 flex flex-col gap-4">
                                        <input
                                            required
                                            placeholder="Card Number"
                                            value={form.cardNumber}
                                            onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                                            className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required
                                                placeholder="MM / YY"
                                                value={form.expiry}
                                                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                                                className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                            />
                                            <input
                                                required
                                                placeholder="CVV"
                                                value={form.cvv}
                                                onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                                                className="bg-transparent border border-neutral-800 h-12 px-4 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right — Order Summary */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-28 bg-[#111] border border-neutral-800 p-6 md:p-8">
                                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 mb-6">
                                    Order Summary
                                </h2>

                                <div className="divide-y divide-neutral-800">
                                    {items.map((item) => (
                                        <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 py-4">
                                            <div className="w-16 h-20 bg-[#0a0a0a] relative shrink-0 overflow-hidden">
                                                {item.product.image ? (
                                                    <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-700 text-[8px] font-bold uppercase">
                                                        {item.product.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.product.name}</p>
                                                    <p className="text-xs text-neutral-500">{item.color} / {item.size} × {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-bold tabular-nums">L.E {(item.product.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-neutral-800 mt-4 pt-4 flex flex-col gap-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span>L.E {totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Shipping</span>
                                        <span>{shipping === 0 ? "Free" : `L.E ${shipping}`}</span>
                                    </div>
                                    {shipping === 0 && (
                                        <p className="text-emerald-500 text-xs">Free shipping on orders over L.E 1,000</p>
                                    )}
                                    <div className="h-px bg-neutral-800 my-1" />
                                    <div className="flex justify-between">
                                        <span className="font-bold uppercase tracking-wider text-sm">Total</span>
                                        <span className="text-xl font-black">L.E {grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full h-14 font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all duration-300 mt-6 ${isProcessing
                                        ? "bg-neutral-800 text-neutral-500"
                                        : "bg-white text-black hover:bg-neutral-200"
                                        }`}
                                >
                                    <Lock className="w-4 h-4" />
                                    {isProcessing ? "Processing..." : "Place Order"}
                                </button>

                                <p className="text-neutral-600 text-[10px] text-center mt-4 tracking-wider">
                                    Your personal data will be used to process your order securely.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
