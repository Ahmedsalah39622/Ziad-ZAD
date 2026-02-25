import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format-currency";
import {
    User,
    ShieldCheck,
    Key,
    MapPin,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    const user = session.user;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
                <p className="text-zinc-500">Manage your administrative preferences and account.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/10 bg-zinc-950 text-white">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-zinc-500" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-600">Your public identity on the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Full Name</p>
                            <p className="text-sm border-b border-white/5 pb-2">{user.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</p>
                            <p className="text-sm border-b border-white/5 pb-2">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Access Level</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">
                                    {(user as any).role}
                                </span>
                                <span className="text-[10px] text-zinc-600 italic">Full administrative privileges</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-zinc-950 text-white">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-zinc-500" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-600">Ensure your account stays protected.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-zinc-900 justify-start h-12">
                            <Key className="mr-2 h-4 w-4 text-zinc-500" />
                            Update Password
                        </Button>
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-zinc-900 justify-start h-12">
                            <Bell className="mr-2 h-4 w-4 text-zinc-500" />
                            Notification Settings
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-zinc-950 text-white md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-zinc-500" />
                            <CardTitle>Store Configuration</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-600">Global settings for your streetwear brand.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Base Currency</p>
                            <p className="text-sm font-bold">Egyptian Pound (L.E)</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Shipping Policy</p>
                            <p className="text-sm text-emerald-500 font-bold uppercase">Free for all orders</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
