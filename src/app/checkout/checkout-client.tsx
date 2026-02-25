"use client";

import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { createOrder } from "@/lib/actions/order-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Truck, Package } from "lucide-react";
import Image from "next/image";

export function CheckoutClient({ user }: { user: any }) {
    const { items, totalItems, totalPrice, clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        customerName: user?.name || "",
        customerEmail: user?.email || "",
        customerPhone: "",
        address: "",
        city: "",
        notes: "",
    });

    if (items.length === 0) {
        return (
            <div className="text-center py-20">
                <Package className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                <p className="text-zinc-400 mb-8">Add some products to your cart before checking out.</p>
                <Button onClick={() => router.push("/shop")} className="bg-white text-black">
                    Go Shopping
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const orderItems = items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
                size: item.size,
                color: item.color,
            }));

            const result = await createOrder({
                ...formData,
                items: orderItems,
                total: totalPrice,
            });

            toast.success("Order placed successfully!");
            clearCart();
            router.push(`/checkout/success?id=${result.id}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to place order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20 font-inter">
            {/* Left Column: Shipping Form */}
            <div className="space-y-8 order-2 lg:order-1">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Truck className="h-6 w-6" /> Shipping Details
                    </h2>
                    <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Full Name</Label>
                                <Input
                                    id="customerName"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                    className="border-white/10 bg-zinc-900/50 text-white rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Phone Number</Label>
                                <Input
                                    id="customerPhone"
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    required
                                    className="border-white/10 bg-zinc-900/50 text-white rounded-xl h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerEmail" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Email Address</Label>
                            <Input
                                id="customerEmail"
                                type="email"
                                value={formData.customerEmail}
                                disabled
                                className="border-white/10 bg-zinc-900/50 text-zinc-500 rounded-xl h-12 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    className="border-white/10 bg-zinc-900/50 text-white rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Street Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="border-white/10 bg-zinc-900/50 text-white rounded-xl h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-zinc-400 text-xs font-medium uppercase tracking-widest">Order Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="border-white/10 bg-zinc-900/50 text-white rounded-xl min-h-[100px]"
                            />
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Payment Method
                            </h3>
                            <div className="p-4 rounded-xl border border-white/20 bg-white/5 flex items-center gap-4">
                                <div className="h-4 w-4 rounded-full border-2 border-white bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                <div>
                                    <p className="text-white font-medium">Cash on Delivery (COD)</p>
                                    <p className="text-zinc-500 text-sm">Pay when you receive your order.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-8 order-1 lg:order-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-xl sticky top-24">
                    <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {items.map((item, idx) => (
                            <div key={`${item.product.id}-${idx}`} className="flex gap-4 items-center">
                                <div className="h-20 w-20 relative rounded-lg bg-zinc-900 overflow-hidden border border-white/5">
                                    {item.product.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] font-bold">
                                            {item.product.name}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{item.product.name}</h4>
                                    <p className="text-zinc-500 text-sm">
                                        {item.size} / {item.color} x {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4 pt-8 border-t border-white/10">
                        <div className="flex justify-between items-center text-zinc-400">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400">
                            <span>Shipping</span>
                            <span className="text-green-500">FREE</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold text-white pt-2">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            disabled={isLoading}
                            className="w-full h-14 bg-white text-black hover:bg-zinc-200 mt-6 rounded-xl text-lg font-black uppercase tracking-tighter"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                "Complete Order"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
