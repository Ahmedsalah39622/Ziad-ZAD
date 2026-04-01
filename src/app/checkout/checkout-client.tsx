"use client";

import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { createOrder } from "@/lib/actions/order-actions";
import { validateDiscountCode } from "@/lib/actions/discount-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Truck, Package, CheckCircle2, Wallet, Zap } from "lucide-react";
import Image from "next/image";
import { initiatePaymobPayment } from "@/lib/actions/payment-actions";


export function CheckoutClient({ user, shippingFee = 0 }: { user: { name?: string | null; email?: string | null } | null, shippingFee?: number }) {
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
        discountCode: "",
    });

    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; pct: number } | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'WALLET' | 'VALU'>('COD');

    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // show empty cart only if there really are no items and we're not currently submitting
    if (items.length === 0 && !isLoading && !isSuccess) {
        return (
            <div className="text-center py-20">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Add some products to your cart before checking out.</p>
                <Button onClick={() => router.push("/shop")} className="bg-primary text-primary-foreground">
                    Go Shopping
                </Button>
            </div>
        );
    }

    if (isSuccess && orderId) {
        return (
            <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-foreground/10 flex items-center justify-center relative">
                        <CheckCircle2 className="h-16 w-16 text-foreground" />
                        <div className="absolute inset-0 rounded-full border border-foreground/20 animate-ping opacity-20" />
                    </div>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic">
                        Order Confirmed
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for your order! We&apos;ve received your request and will contact you shortly to confirm the shipping.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8 text-left space-y-4 backdrop-blur-xl w-full max-w-md mx-auto">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Order ID</span>
                        <span className="text-foreground font-mono text-sm">{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Status</span>
                        <span className="px-3 py-1 bg-secondary text-foreground border border-border rounded-full text-xs font-bold">
                            PENDING
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Payment Method</span>
                        <span className="text-foreground font-bold">Cash on Delivery</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto pt-4">
                    <Button onClick={() => router.push('/shop')} className="h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-black uppercase tracking-tighter text-lg">
                        Continue Shopping
                    </Button>
                    <Button onClick={() => router.push('/')} variant="outline" className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider">
                        Home Page
                    </Button>
                </div>
            </div>
        );
    }

    const handleApplyDiscount = async () => {
        if (!formData.discountCode) {
            toast.error("Please enter a discount code");
            return;
        }

        setIsValidating(true);
        try {
            const dc = await validateDiscountCode(formData.discountCode);
            setAppliedDiscount({ code: dc.code, pct: dc.discountPct });
            toast.success(`Discount code "${dc.code}" applied! (${dc.discountPct}% off)`);
        } catch (err) {
            setAppliedDiscount(null);
            toast.error(err instanceof Error ? err.message : "Failed to apply discount code");
        } finally {
            setIsValidating(false);
        }
    };

    const discountAmount = appliedDiscount ? (totalPrice * appliedDiscount.pct) / 100 : 0;
    const finalTotal = totalPrice - discountAmount + shippingFee;

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
                discountCode: appliedDiscount?.code || undefined,
                items: orderItems,
                total: totalPrice,
                shippingFee: shippingFee,
                paymentMethod: paymentMethod
            });

            if (paymentMethod === 'COD') {
                toast.success("Order placed successfully!");

                setOrderId(result.id);
                setIsSuccess(true);
                clearCart();
                router.prefetch('/shop');
            } else {
                // Online Payment Flow
                toast.info("Redirecting to secure payment...");
                const { checkoutUrl, error } = await initiatePaymobPayment(result.id, paymentMethod);

                if (error || !checkoutUrl) {
                    toast.error(error || "Failed to start online payment. Please try again.");
                    setIsLoading(false);
                    return;
                }

                clearCart(); // Clear cart before redirecting so user doesn't come back to a filled cart
                window.location.href = checkoutUrl;
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20 font-inter">
            {/* Left Column: Shipping Form */}
            <div className="space-y-8 order-2 lg:order-1">
                <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Truck className="h-6 w-6" /> Shipping Details
                    </h2>
                    <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Full Name</Label>
                                <Input
                                    id="customerName"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                    className="border-border bg-secondary/50 text-foreground rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Phone Number</Label>
                                <Input
                                    id="customerPhone"
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    required
                                    className="border-border bg-secondary/50 text-foreground rounded-xl h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customerEmail" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Email Address</Label>
                            <Input
                                id="customerEmail"
                                type="email"
                                value={formData.customerEmail}
                                disabled
                                className="border-border bg-secondary/50 text-muted-foreground rounded-xl h-12 cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    className="border-border bg-secondary/50 text-foreground rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Street Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="border-border bg-secondary/50 text-foreground rounded-xl h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Order Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="border-border bg-secondary/50 text-foreground rounded-xl min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountCode" className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Discount Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="discountCode"
                                    value={formData.discountCode}
                                    onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.trim().toUpperCase() })}
                                    placeholder="Enter code (optional)"
                                    className="border-border bg-secondary/50 text-foreground rounded-xl h-12"
                                />
                                <Button
                                    type="button"
                                    onClick={handleApplyDiscount}
                                    disabled={isValidating || !formData.discountCode}
                                    className="h-12 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold uppercase text-xs tracking-widest"
                                >
                                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                </Button>
                            </div>
                            {appliedDiscount && (
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-2 px-1">
                                    Code applied: {appliedDiscount.code} ({appliedDiscount.pct}% off)
                                </p>
                            )}
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Payment Method
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {/* COD */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left ${paymentMethod === 'COD' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-foreground' : 'border-muted-foreground'}`}>
                                        {paymentMethod === 'COD' && <div className="h-2 w-2 rounded-full bg-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground font-bold text-sm tracking-tight uppercase italic">Cash on Delivery</p>
                                        <p className="text-muted-foreground text-xs">Pay with cash when your order arrives.</p>
                                    </div>
                                    <Truck className="h-5 w-5 text-muted-foreground/50" />
                                </button>

                                {/* CARD */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left ${paymentMethod === 'CARD' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-foreground' : 'border-muted-foreground'}`}>
                                        {paymentMethod === 'CARD' && <div className="h-2 w-2 rounded-full bg-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground font-bold text-sm tracking-tight uppercase italic font-mono uppercase italic">Credit / Debit Card</p>
                                        <p className="text-muted-foreground text-xs">Secure payment via Paymob.</p>
                                    </div>
                                    <CreditCard className="h-5 w-5 text-muted-foreground/50" />
                                </button>

                                {/* WALLET */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('WALLET')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left ${paymentMethod === 'WALLET' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'WALLET' ? 'border-foreground' : 'border-muted-foreground'}`}>
                                        {paymentMethod === 'WALLET' && <div className="h-2 w-2 rounded-full bg-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground font-bold text-sm tracking-tight uppercase italic font-mono uppercase italic">Mobile Wallets</p>
                                        <p className="text-muted-foreground text-xs">Vodafone Cash, Etisalat Cash, etc.</p>
                                    </div>
                                    <Wallet className="h-5 w-5 text-muted-foreground/50" />
                                </button>

                                {/* VALU */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('VALU')}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 text-left ${paymentMethod === 'VALU' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VALU' ? 'border-foreground' : 'border-muted-foreground'}`}>
                                        {paymentMethod === 'VALU' && <div className="h-2 w-2 rounded-full bg-foreground" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground font-bold text-sm tracking-tight uppercase italic font-mono uppercase italic">ValU / Installments</p>
                                        <p className="text-muted-foreground text-xs">Pay in installments over 6-60 months.</p>
                                    </div>
                                    <Zap className="h-5 w-5 text-muted-foreground/50" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-8 order-1 lg:order-2">
                <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl sticky top-24">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-foreground/10">
                        {items.map((item, idx) => (
                            <div key={`${item.product.id}-${idx}`} className="flex gap-4 items-center">
                                <div className="h-20 w-20 relative rounded-lg bg-secondary overflow-hidden border border-border">
                                    {item.product.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-bold">
                                            {item.product.name}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-foreground font-medium truncate">{item.product.name}</h4>
                                    <p className="text-muted-foreground text-sm">
                                        {item.size} / {item.color} x {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-foreground font-bold">L.E {(item.product.price * item.quantity).toLocaleString('en-US')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4 pt-8 border-t border-border">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>L.E {totalPrice.toLocaleString('en-US')}</span>
                        </div>
                        {appliedDiscount && (
                            <div className="flex justify-between items-center text-primary font-bold">
                                <span>Discount ({appliedDiscount.pct}%)</span>
                                <span>- L.E {discountAmount.toLocaleString('en-US')}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Shipping</span>
                            <span className="text-foreground font-medium">
                                {shippingFee === 0 ? "FREE" : `L.E ${shippingFee.toLocaleString('en-US')}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold text-foreground pt-2">
                            <span>Total</span>
                            <span>L.E {finalTotal.toLocaleString('en-US')}</span>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            disabled={isLoading}
                            className="w-full h-14 bg-primary text-primary-foreground hover:opacity-90 mt-6 rounded-xl text-lg font-black uppercase tracking-tighter"
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
