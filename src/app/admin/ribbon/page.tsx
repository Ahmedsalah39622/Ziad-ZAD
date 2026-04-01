import { getSetting } from "@/lib/actions/settings-actions";
import { RibbonForm } from "./ribbon-form";

// ISR: Revalidate every 1 minute
export const revalidate = 60;

export default async function AdminRibbonPage() {
    const ribbonSettingsRaw = await getSetting("ribbon_settings", JSON.stringify({
        text: "🔥 MASSIVE SALE: GET 20% OFF EVERYTHING INC. NEW DROPS!",
        bgHex: "#ef4444",
        textHex: "#ffffff",
        active: false,
    }));

    const ribbonSettings = JSON.parse(ribbonSettingsRaw);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Ribbon</h1>
                <p className="text-muted-foreground mt-2">
                    Manage the global announcement ribbon displayed at the top of the store.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_400px]">
                {/* Left Side: Form */}
                <RibbonForm initialSettings={ribbonSettings} />

                {/* Right Side: Preview Guide */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-2">Live Preview</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            The ribbon will appear exactly as configured across all shop pages and the homepage.
                        </p>
                        <div className="relative border border-dashed border-border rounded-md overflow-hidden bg-background h-32 flex flex-col pt-4">
                            {/* Fake navbar */}
                            <div className="flex items-center justify-between px-4 pb-2 border-b border-border/50">
                                <div className="font-bold text-xs">ZAD</div>
                                <div className="w-12 h-2 bg-muted rounded-full" />
                            </div>

                            {/* Live Preview Ribbon injected by RibbonForm */}
                            <div id="ribbon-preview-container" className="w-full mt-2" />

                            <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-xs">
                                Page Content
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
