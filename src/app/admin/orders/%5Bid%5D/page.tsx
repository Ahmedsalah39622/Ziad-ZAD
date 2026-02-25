import { getOrderById, updateOrderStatus } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Package,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    Truck,
    XCircle,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format-currency";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    const statusSteps = [
        { id: 'PENDING', label: 'Pending', icon: Clock },
        { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
        { id: 'SHIPPED', label: 'Shipped', icon: Truck },
        { id: 'DELIVERED', label: 'Delivered', icon: Package },
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);

    // Format WhatsApp Link
    const whatsappNumber = order.customerPhone.replace(/\D/g, ""); // Remove non-numeric
    const whatsappLink = `https://wa.me/${whatsappNumber.startsWith('2') ? whatsappNumber : '20' + whatsappNumber}`; // Assume Egypt if no code

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black tracking-tighter uppercase tracking-[-0.02em]">Order <span className="text-emerald-500">#{id.substring(0, 8).toUpperCase()}</span></h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                            <Calendar className="h-3 w-3" />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(order.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800" asChild>
                        <Link href={whatsappLink} target="_blank">
                            <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" />
                            Contact via WhatsApp
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Products & Status */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Status Timeline Card */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl overflow-hidden relative">
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-8 flex items-center gap-2">
                            <div className="w-1 h-3 bg-emerald-500" /> Fulfillment Status
                        </h2>

                        <div className="relative flex justify-between mb-12 max-w-2xl mx-auto">
                            <div className="absolute left-[5%] top-1/2 h-0.5 w-[90%] -translate-y-1/2 bg-zinc-900" />
                            <div
                                className="absolute left-[5%] top-1/2 h-0.5 -translate-y-1/2 bg-emerald-500 transition-all duration-700"
                                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 90}%` }}
                            />

                            {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-black scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-zinc-800 bg-zinc-950 text-zinc-700'
                                            }`}>
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-zinc-700'
                                            }`}>{step.label}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                <form action={async () => {
                                    "use server";
                                    const nextStatus = statusSteps[currentStepIndex + 1]?.id;
                                    if (nextStatus) await updateOrderStatus(order.id, nextStatus);
                                }}>
                                    <Button className="bg-white text-black hover:bg-emerald-400 hover:text-black font-bold uppercase text-xs tracking-widest px-8">
                                        Mark as {statusSteps[currentStepIndex + 1]?.label}
                                    </Button>
                                </form>
                            )}
                            {order.status !== 'CANCELLED' && (
                                <form action={async () => {
                                    "use server";
                                    await updateOrderStatus(order.id, 'CANCELLED');
                                }}>
                                    <Button variant="ghost" className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 font-bold uppercase text-xs tracking-widest">
                                        Cancel Order
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Order Items Card */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/10 bg-white/[0.02]">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Package className="h-4 w-4 text-emerald-500" /> Order Contents
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {order.items.map((item) => {
                                const productImages = JSON.parse(item.product.images || "[]");
                                const productImage = productImages[0]?.url;

                                return (
                                    <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="h-24 w-20 bg-zinc-900 border border-white/5 rounded-xl overflow-hidden relative shadow-lg">
                                                {productImage ? (
                                                    <Image
                                                        src={productImage}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-zinc-800">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase text-base mb-1 tracking-tight">{item.product.name}</p>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                    {item.size && (
                                                        <span className="bg-zinc-900 px-2 py-1 rounded border border-white/5">Size: {item.size}</span>
                                                    )}
                                                    {item.color && (
                                                        <span className="bg-zinc-900 px-2 py-1 rounded border border-white/5">Color: {item.color}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-emerald-500/80 mt-2 font-bold tracking-widest">QTY: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-black text-white text-lg">{formatCurrency(item.price * item.quantity)}</p>
                                            <p className="text-[10px] text-zinc-600 font-medium">{formatCurrency(item.price)} each</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-zinc-900/40 mt-auto">
                            <div className="max-w-xs ml-auto space-y-3">
                                <div className="flex justify-between text-zinc-500 text-xs font-medium">
                                    <span>Subtotal</span>
                                    <span className="font-mono text-zinc-300">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500 text-xs font-medium">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 font-bold uppercase tracking-widest">Calculated at steps</span>
                                </div>
                                <div className="h-px bg-white/10 w-full my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                    <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Customer Card */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 flex items-center gap-2">
                            <User className="h-3 w-3" /> Customer Profile
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-emerald-500 font-black text-lg border border-emerald-500/10">
                                    {order.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-white uppercase tracking-tight">{order.customerName}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{order.customerEmail}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.open(whatsappLink, '_blank')}>
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-zinc-600">Phone & WhatsApp</p>
                                        <p className="text-sm font-bold text-zinc-300">{order.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-zinc-600">Email Address</p>
                                        <p className="text-sm font-bold text-zinc-300">{order.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs py-6" asChild>
                                <Link href={whatsappLink} target="_blank">Send Message</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Shipping Card */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-emerald-500" /> Shipping Destination
                        </h2>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                            <p className="text-sm text-zinc-300 font-medium leading-relaxed mb-2">{order.address}</p>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">City</div>
                                <p className="font-black text-white uppercase text-sm tracking-widest">{order.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-2">
                            Notes for Handler
                        </h2>
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <p className="text-sm text-zinc-400 italic leading-relaxed">
                                {order.notes || "No special instructions provided by the customer."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
