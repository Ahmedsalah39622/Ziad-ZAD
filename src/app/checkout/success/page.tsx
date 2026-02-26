import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = await searchParams;
    const id = params.id;
    if (!id) notFound();

    const order = await getOrderById(id);
    if (!order) notFound();

    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 font-inter">
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-foreground/10 flex items-center justify-center relative">
                        <CheckCircle2 className="h-16 w-16 text-foreground" />
                        <div className="absolute inset-0 rounded-full border border-foreground/20 animate-ping opacity-20" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic">
                        Order Confirmed
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Thank you for your order, {order.customerName}. We&apos;ve received your request and will contact you shortly to confirm the shipping.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/50 p-8 text-left space-y-6 backdrop-blur-xl">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Order ID</span>
                        <span className="text-foreground font-mono text-sm">{order.id}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Status</span>
                        <span className="px-3 py-1 bg-secondary text-foreground border border-border rounded-full text-xs font-bold">
                            {order.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Total Amount</span>
                        <span className="text-foreground font-black text-xl">L.E {order.total.toLocaleString()}</span>
                    </div>
                    {order.discountCode && (
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Discount ({order.discountCode})</span>
                            <span className="text-foreground font-bold">{order.discountPct}%</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Payment Method</span>
                        <span className="text-foreground font-bold">Cash on Delivery</span>
                    </div>
                </div>
                {/* ordered items list */}
                <div className="rounded-2xl border border-border bg-card/50 p-8 text-left space-y-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-widest">Ordered Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground font-medium truncate">{item.product.name}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {item.size} / {item.color} x {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-foreground font-bold">L.E {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Button asChild className="h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-black uppercase tracking-tighter text-lg">
                        <Link href="/shop" className="flex items-center gap-2">
                            Back to Shop <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-5 w-5" /> Home Page
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
