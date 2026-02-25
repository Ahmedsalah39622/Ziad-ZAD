import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";

export default async function SuccessPage({ searchParams }: { searchParams: any }) {
    const id = (await searchParams).id;
    if (!id) notFound();

    const order = await getOrderById(id);
    if (!order) notFound();

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8 font-inter">
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center relative">
                        <CheckCircle2 className="h-16 w-16 text-white" />
                        <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        Order Confirmed
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md mx-auto">
                        Thank you for your order, {order.customerName}. We&apos;ve received your request and will contact you shortly to confirm the shipping.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-8 text-left space-y-6 backdrop-blur-xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Order ID</span>
                        <span className="text-white font-mono text-sm">{order.id}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Status</span>
                        <span className="px-3 py-1 bg-zinc-900 text-white border border-white/10 rounded-full text-xs font-bold">
                            {order.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Total Amount</span>
                        <span className="text-white font-black text-xl">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Payment Method</span>
                        <span className="text-white font-bold">Cash on Delivery</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Button asChild className="h-14 bg-white text-black hover:bg-zinc-200 rounded-xl font-black uppercase tracking-tighter text-lg">
                        <Link href="/shop" className="flex items-center gap-2">
                            Back to Shop <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-14 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white rounded-xl font-bold uppercase tracking-wider">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-5 w-5" /> Home Page
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
