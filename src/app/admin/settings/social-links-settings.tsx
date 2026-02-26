"use client";

import { useState } from "react";
import { setSetting } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Share2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { GithubIcon, InstagramIcon, LinkedInIcon, TikTokIcon, XIcon, FacebookIcon } from "@/components/footer/icons";

export type SocialLinksConfig = {
    x: string;
    linkedin: string;
    github: string;
    instagram: string;
    tiktok: string;
    facebook: string;
};

export function SocialLinksSettings({ initialConfig }: { initialConfig: SocialLinksConfig }) {
    const [config, setConfig] = useState<SocialLinksConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await setSetting("footer_social_links", JSON.stringify(config));
            if (result.success) {
                toast.success("Social links updated successfully.");
            } else {
                toast.error(result.error || "Failed to save social links.");
            }
        } catch (error) {
            console.error("Error saving social links:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (platform: keyof SocialLinksConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [platform]: value }));
    };

    const platforms = [
        { id: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "https://instagram.com/..." },
        { id: "tiktok", label: "TikTok", icon: TikTokIcon, placeholder: "https://tiktok.com/@..." },
        { id: "facebook", label: "Facebook", icon: FacebookIcon, placeholder: "https://facebook.com/..." },
        { id: "x", label: "X (Twitter)", icon: XIcon, placeholder: "https://x.com/..." },
        { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon, placeholder: "https://linkedin.com/..." },
        { id: "github", label: "GitHub", icon: GithubIcon, placeholder: "https://github.com/..." },
    ] as const;

    return (
        <Card className="border-border bg-card text-foreground md:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Social Media Links</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground/60">
                    Configure the social media links displayed in the storefront footer. Leave a field blank to hide that icon.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((platform) => (
                        <div key={platform.id} className="space-y-2">
                            <label htmlFor={platform.id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <platform.icon className="w-3 h-3 fill-current" />
                                {platform.label}
                            </label>
                            <Input
                                id={platform.id}
                                value={config[platform.id as keyof SocialLinksConfig]}
                                onChange={(e) => handleChange(platform.id as keyof SocialLinksConfig, e.target.value)}
                                placeholder={platform.placeholder}
                                className="bg-foreground/5 border-border focus:border-border/50 font-mono text-xs"
                            />
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-foreground text-background hover:bg-foreground/90 font-bold tracking-wider uppercase text-xs"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
