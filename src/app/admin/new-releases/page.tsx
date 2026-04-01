import { getSetting } from "@/lib/actions/settings-actions";
import { NewReleasesForm } from "./new-releases-form";

// ISR: Revalidate every 1 minute
export const revalidate = 60;

export default async function NewReleasesAdminPage() {
    const settingsRaw = await getSetting("new_releases_settings", JSON.stringify({
        text: "NEW DROP: THE FUTURE IS HERE. SHOP THE COLLECTION NOW.",
        bgHex: "#000000",
        textHex: "#ffffff",
        shimmerHex: "#ffffff",
        heroImage: "/zad_green_shirt_studio.png",
        heroGlowHex: "#065f46",
        heroAccentHex: "#10b981",
        startingPrice: "L.E 599",
        badgeDotColor: "#10b981",
        badgeTextColor: "#10b981",
        active: false,
    }));

    const settings = JSON.parse(settingsRaw);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Releases Ribbon</h1>
                <p className="text-muted-foreground mt-2">
                    Manage the &quot;New Releases&quot; announcement ribbon. This ribbon features a custom shimmer effect.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_400px]">
                {/* Left Side: Form */}
                <NewReleasesForm initialSettings={settings} />

                {/* Right Side: Preview Guide */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Unlike the standard ribbon, the &quot;New Releases&quot; ribbon allows you to customize the <strong>Shimmer Color</strong>.
                            This color determines the tint of the moving light reflection.
                        </p>
                        <div className="relative border border-dashed border-border rounded-md overflow-hidden bg-background h-32 flex flex-col pt-4">
                            <div className="flex items-center justify-between px-4 pb-2 border-b border-border/50">
                                <div className="font-bold text-xs uppercase">ZAD</div>
                                <div className="w-12 h-2 bg-muted rounded-full" />
                            </div>

                            <div id="new-releases-preview-container" className="w-full mt-2" />

                            <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-xs">
                                About Page / Shop Page
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
