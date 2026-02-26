import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Package,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CheckCircle2,
    Clock,
    Truck,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format-currency";
import { OrderDetailActions } from "@/components/admin/order-detail-actions";

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
        { id: 'DONE', label: 'Done', icon: CheckCircle2 },
        { id: 'SHIPPED', label: 'Shipped', icon: Truck },
        { id: 'DELIVERED', label: 'Delivered', icon: Package },
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);
    const nextStep = statusSteps[currentStepIndex + 1];

    // Calculate subtotal from items to ensure accuracy
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = (order as any).shippingFee || 0;
    const discountAmount = order.discountPct > 0 ? (subtotal * order.discountPct) / 100 : 0;
    const finalTotal = order.total; // The order.total already has the discount AND shipping applied from the database

    // Format WhatsApp Link
    const whatsappNumber = order.customerPhone.replace(/\D/g, ""); // Remove non-numeric
    const whatsappLink = `https://wa.me/${whatsappNumber.startsWith('2') ? whatsappNumber : '20' + whatsappNumber}`; // Assume Egypt if no code

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full border border-border bg-foreground/5 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Order <span className="text-foreground">#{id.substring(0, 8).toUpperCase()}</span></h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-500' :
                                order.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-500' :
                                    'bg-foreground text-background'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                            <Calendar className="h-3 w-3" />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(order.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" asChild>
                        <Link href={whatsappLink} target="_blank">
                            <MessageSquare className="mr-2 h-4 w-4 text-foreground" />
                            Contact via WhatsApp
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Products & Status */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Status Timeline Card */}
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl overflow-hidden relative">
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />

                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-2">
                            <div className="w-1 h-3 bg-foreground" /> Fulfillment Status
                        </h2>

                        <div className="relative flex justify-between mb-12 max-w-2xl mx-auto">
                            <div className="absolute left-[5%] top-1/2 h-0.5 w-[90%] -translate-y-1/2 bg-secondary" />
                            <div
                                className="absolute left-[5%] top-1/2 h-0.5 -translate-y-1/2 bg-foreground transition-all duration-700"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 90}%` }}
                            />

                            {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${isCompleted ? 'border-foreground bg-foreground text-background scale-110 shadow-3xl' : 'border-border bg-card text-muted-foreground/40'
                                            }`}>
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-foreground' : 'text-muted-foreground/40'
                                            }`}>{step.label}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <OrderDetailActions
                            orderId={order.id}
                            currentStatus={order.status}
                            nextStatusId={nextStep?.id}
                            nextStatusLabel={nextStep?.label}
                        />
                    </div>

                    {/* Order Items Card */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border bg-foreground/[0.02]">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Package className="h-4 w-4 text-foreground" /> Order Contents
                            </h2>
                        </div>
                        <div className="divide-y divide-border/5">
                            {order.items.map((item) => {
                                // Safe JSON parsing
                                let productImages = [];
                                try {
                                    productImages = typeof item.product.images === 'string'
                                        ? JSON.parse(item.product.images)
                                        : (item.product.images || []);
                                } catch {
                                    productImages = [];
                                }
                                const productImage = productImages[0]?.url;

                                return (
                                    <div key={item.id} className="p-6 flex items-center justify-between group hover:bg-foreground/[0.01] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="h-24 w-20 bg-secondary border border-border/5 rounded-xl overflow-hidden relative shadow-lg">
                                                {productImage ? (
                                                    <Image
                                                        src={productImage}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase text-base mb-1 tracking-tight">{item.product.name}</p>
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    {item.size && (
                                                        <span className="bg-secondary px-2 py-1 rounded border border-border/5">Size: {item.size}</span>
                                                    )}
                                                    {item.color && (
                                                        <span className="bg-secondary px-2 py-1 rounded border border-border/5">Color: {item.color}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 font-bold tracking-widest">QTY: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-black text-foreground text-lg">{formatCurrency(item.price * item.quantity)}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{formatCurrency(item.price)} each</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Footer */}
                        <div className="p-8 bg-foreground/5 mt-auto">
                            <div className="max-w-xs ml-auto space-y-3">
                                <div className="flex justify-between text-muted-foreground text-xs font-medium">
                                    <span>Subtotal</span>
                                    <span className="font-mono text-foreground">{formatCurrency(subtotal)}</span>
                                </div>
                                {order.discountCode && (
                                    <div className="flex justify-between text-primary text-xs font-black uppercase tracking-widest">
                                        <span>Discount ({order.discountCode})</span>
                                        <span className="font-mono">- {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground text-xs font-medium">
                                    <span>Shipping</span>
                                    <span className="text-foreground font-bold uppercase tracking-widest">
                                        {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
                                    </span>
                                </div>
                                <div className="h-px bg-border w-full my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                    <span className="text-3xl font-black text-foreground font-mono tracking-tighter leading-none">{formatCurrency(finalTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Customer Card */}
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full blur-2xl pointer-events-none" />

                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                            <User className="h-3 w-3" /> Customer Profile
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-black text-lg border border-foreground/10">
                                    {order.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-foreground uppercase tracking-tight">{order.customerName}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono tracking-tight">{order.customerEmail}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border/5">
                                <Link href={whatsappLink} target="_blank" className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-lg bg-foreground/10 text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-muted-foreground">Phone & WhatsApp</p>
                                        <p className="text-sm font-bold text-foreground">{order.customerPhone}</p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-muted-foreground">Email Address</p>
                                        <p className="text-sm font-bold text-foreground">{order.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest text-xs py-6" asChild>
                                <Link href={whatsappLink} target="_blank">Send Message</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Shipping Card */}
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-foreground" /> Shipping Destination
                        </h2>
                        <div className="bg-secondary p-4 rounded-xl border border-border/5">
                            <p className="text-sm text-foreground font-medium leading-relaxed mb-2">{order.address}</p>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 rounded bg-foreground/10 text-foreground text-[10px] font-black uppercase">City</div>
                                <p className="font-black text-foreground uppercase text-sm tracking-widest">{order.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                            Notes for Handler
                        </h2>
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                {order.notes || "No special instructions provided by the customer."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
