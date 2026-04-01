import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import { Nav } from "@/components/hero/nav";
import { Footer } from "@/components/footer/footer";

export default async function CheckoutStatusPage({ searchParams }: { searchParams: Promise<{ 
    status?: string; 
    orderId?: string; 
    txnId?: string; 
}> }) {
    const params = await searchParams;
    const { status, orderId, txnId } = params;

    if (!orderId) notFound();

    const order = await getOrderById(orderId);
    if (!order) notFound();

    const isSuccess = status === 'success';

    return (
        <main className="min-h-screen bg-background font-inter flex flex-col">
            <Nav />
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-32">
                <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-center">
                        {isSuccess ? (
                            <div className="h-28 w-28 rounded-full bg-foreground/10 flex items-center justify-center relative shadow-2xl">
                                <CheckCircle2 className="h-20 w-20 text-foreground" />
                                <div className="absolute inset-0 rounded-full border border-foreground/20 animate-ping opacity-20" />
                            </div>
                        ) : (
                            <div className="h-28 w-28 rounded-full bg-destructive/10 flex items-center justify-center relative shadow-2xl">
                                <XCircle className="h-20 w-20 text-destructive" />
                                <div className="absolute inset-0 rounded-full border border-destructive/20 animate-pulse opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic px-4">
                            {isSuccess ? "Order Confirmed" : "Payment Failed"}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            {isSuccess 
                                ? `Thank you for your order, ${order.customerName}. We've received your request and will contact you shortly to confirm the shipping.`
                                : "There was an issue processing your payment. Don't worry, your order has been saved but we couldn't complete the payment."
                            }
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/40 p-8 text-left space-y-6 backdrop-blur-xl shadow-2xl">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Order Reference</span>
                            <span className="text-foreground font-mono text-xs">{order.id}</span>
                        </div>
                        {txnId && (
                            <div className="flex justify-between items-center border-b border-border pb-4">
                                <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Transaction ID</span>
                                <span className="text-foreground font-mono text-xs">{txnId}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Status</span>
                            <span className={`px-4 py-1.5 ${isSuccess ? 'bg-foreground text-background' : 'bg-destructive/10 text-destructive'} rounded-full text-[10px] font-black uppercase tracking-widest`}>
                                {isSuccess ? "PAID" : "FAILED"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Total Amount</span>
                            <span className="text-foreground font-black text-2xl tracking-tighter">L.E {order.total.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Payment Method</span>
                            <span className="text-foreground font-bold tracking-tight uppercase italic">{order.paymentMethod}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        {isSuccess ? (
                            <>
                                <Button asChild className="h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-primary/10">
                                    <Link href="/shop" className="flex items-center gap-2">
                                        Back to Shop <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider text-sm">
                                    <Link href="/" className="flex items-center gap-2">
                                        <Home className="h-5 w-5" /> Home Page
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild className="h-14 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-foreground/10">
                                    <Link href="/checkout" className="flex items-center gap-2">
                                        Retry Payment <RefreshCw className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-14 border-border bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground rounded-xl font-bold uppercase tracking-wider text-sm">
                                    <Link href="/shop" className="flex items-center gap-2">
                                        <ArrowRight className="h-5 w-5" /> Continue Shopping
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
