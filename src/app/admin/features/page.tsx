import { getSetting } from "@/lib/actions/settings-actions";
import { FeaturesForm } from "./features-form";

// ISR: Revalidate every 1 minute
export const revalidate = 60;

export default async function FeaturesAdminPage() {
    const settingsRaw = await getSetting("feature_settings", "{}");
    const settings = JSON.parse(settingsRaw);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feature Cards</h1>
                <p className="text-muted-foreground mt-2">
                    Manage the content and background images for the four feature cards on the home page.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_400px]">
                {/* Left Side: Form */}
                <FeaturesForm initialSettings={settings} />

                {/* Right Side: Preview Guide */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            You can customize the <strong>Title</strong>, <strong>Description</strong>, and <strong>Background Image</strong> for each of the four cards.
                        </p>
                        <div className="space-y-4">
                            <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Titles</p>
                                <p className="text-[10px] text-muted-foreground">Keep them short and impactful (2-4 words).</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Descriptions</p>
                                <p className="text-[10px] text-muted-foreground">Explain the feature clearly in 1-2 sentences.</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Images</p>
                                <p className="text-[10px] text-muted-foreground">High-quality images with an aspect ratio around 3:2 work best.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
