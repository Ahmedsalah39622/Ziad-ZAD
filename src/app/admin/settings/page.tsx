import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    User,
    ShieldCheck,
    Key,
    MapPin,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getSetting } from "@/lib/actions/settings-actions";
import { SocialLinksSettings, SocialLinksConfig } from "./social-links-settings";
import { WhatsAppSettings } from "./whatsapp-settings";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    const user = session.user;

    // Fetch social settings
    const socialLinksStr = await getSetting("footer_social_links", "{}");
    let socialConfig: SocialLinksConfig = {
        x: "",
        linkedin: "",
        github: "",
        instagram: "",
        tiktok: "",
        facebook: "",
    };
    try {
        const parsed = JSON.parse(socialLinksStr);
        socialConfig = { ...socialConfig, ...parsed };
    } catch (e) {
        console.error("Failed to parse social config", e);
    }

    // Fetch WhatsApp number
    const whatsappNumber = await getSetting("whatsapp_number", "");

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
                <p className="text-muted-foreground">Manage your administrative preferences and account.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border bg-card text-foreground">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground/60">Your public identity on the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</p>
                            <p className="text-sm border-b border-border/5 pb-2">{user.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</p>
                            <p className="text-sm border-b border-border/5 pb-2">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Level</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold text-foreground uppercase">
                                    {(user as { role: string }).role}
                                </span>
                                <span className="text-[10px] text-muted-foreground italic">Full administrative privileges</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card text-foreground">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground/60">Ensure your account stays protected.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full border-border text-foreground hover:bg-foreground/5 justify-start h-12">
                            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                            Update Password
                        </Button>
                        <Button variant="outline" className="w-full border-border text-foreground hover:bg-foreground/5 justify-start h-12">
                            <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                            Notification Settings
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card text-foreground md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Store Configuration</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground/60">Global settings for your streetwear brand.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base Currency</p>
                            <p className="text-sm font-bold">Egyptian Pound (L.E)</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping Policy</p>
                            <p className="text-sm text-foreground font-bold uppercase">Free for all orders</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links Form */}
                <SocialLinksSettings initialConfig={socialConfig} />

                {/* WhatsApp Config Form */}
                <WhatsAppSettings initialNumber={whatsappNumber} />
            </div>
        </div>
    );
}
