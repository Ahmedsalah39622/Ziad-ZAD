"use client";

import { useState, useEffect, useRef } from "react";
import { setSetting, uploadHeroImage } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface NewReleasesSettings {
    text: string;
    bgHex: string;
    textHex: string;
    shimmerHex: string;
    heroImage?: string;
    heroGlowHex?: string;
    heroAccentHex?: string;
    startingPrice?: string;
    badgeDotColor?: string;
    badgeTextColor?: string;
    active: boolean;
}

export function NewReleasesForm({ initialSettings }: { initialSettings: NewReleasesSettings }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [text, setText] = useState(initialSettings.text || "");
    const [bgHex, setBgHex] = useState(initialSettings.bgHex || "#000000");
    const [textHex, setTextHex] = useState(initialSettings.textHex || "#ffffff");
    const [shimmerHex, setShimmerHex] = useState(initialSettings.shimmerHex || "#ffffff");
    const [heroImage, setHeroImage] = useState(initialSettings.heroImage || "/zad_green_shirt_studio.png");
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [heroGlowHex, setHeroGlowHex] = useState(initialSettings.heroGlowHex || "#065f46");
    const [heroAccentHex, setHeroAccentHex] = useState(initialSettings.heroAccentHex || "#10b981");
    const [startingPrice, setStartingPrice] = useState(initialSettings.startingPrice || "L.E 599");
    const [badgeDotColor, setBadgeDotColor] = useState(initialSettings.badgeDotColor || initialSettings.heroAccentHex || "#10b981");
    const [badgeTextColor, setBadgeTextColor] = useState(initialSettings.badgeTextColor || initialSettings.heroAccentHex || "#10b981");
    const [active, setActive] = useState(initialSettings.active ?? false);
    const [loading, setLoading] = useState(false);
    const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPreviewContainer(document.getElementById("new-releases-preview-container"));
    }, []);

    const handleFileSelect = (file: File) => {
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            toast.success(`Image selected: ${file.name}. Click 'Save' to upload.`);
        }
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        let finalHeroImagePath = heroImage;

        if (selectedFile && heroImagePreview) {
            const extension = selectedFile.name.split('.').pop();
            const baseName = selectedFile.name.split('.').slice(0, -1).join('.')
                .replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const cleanName = `${baseName}_${Date.now()}.${extension}`;

            const uploadRes = await uploadHeroImage(heroImagePreview, cleanName);
            if (uploadRes.success && uploadRes.path) {
                finalHeroImagePath = uploadRes.path;
                setHeroImage(uploadRes.path);
                setHeroImagePreview(null);
                setSelectedFile(null);
            } else {
                toast.error("Failed to upload image. Settings not saved.");
                setLoading(false);
                return;
            }
        }

        const payload = JSON.stringify({
            text,
            bgHex,
            textHex,
            shimmerHex,
            heroImage: finalHeroImagePath,
            heroGlowHex,
            heroAccentHex,
            startingPrice,
            badgeDotColor,
            badgeTextColor,
            active,
        });

        const res = await setSetting("new_releases_settings", payload);
        if (res.success) {
            toast.success("New Releases settings updated successfully.");
        } else {
            toast.error(res.error || "Failed to save settings.");
        }

        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6 bg-card border border-border p-6 rounded-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="space-y-1">
                        <Label className="font-bold">Enable New Releases Features</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable the specialized ribbon and custom hero section.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-5 h-5 accent-primary"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Ribbon Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b border-border pb-2 uppercase tracking-tight">Ribbon Settings</h3>
                        <div className="space-y-2">
                            <Label htmlFor="ribbon-text">Ribbon Text</Label>
                            <Input
                                id="ribbon-text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="e.g. NEW DROP: THE FUTURE IS HERE."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ribbon Background</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={bgHex}
                                        onChange={(e) => setBgHex(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{bgHex}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Ribbon Text Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={textHex}
                                        onChange={(e) => setTextHex(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{textHex}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Shimmer Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={shimmerHex}
                                        onChange={(e) => setShimmerHex(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{shimmerHex}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-bold text-lg border-b border-border pb-2 uppercase tracking-tight">Hero Customization</h3>
                        <div className="space-y-2">
                            <Label htmlFor="hero-image">Hero Image</Label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelect(file);
                                }}
                            />

                            <div
                                className="group relative border-2 border-dashed border-border rounded-xl p-4 transition-colors hover:border-primary/50 flex flex-col items-center justify-center gap-3 bg-muted/50 cursor-pointer overflow-hidden min-h-[160px]"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) handleFileSelect(file);
                                }}
                            >
                                {heroImagePreview || heroImage ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-background">
                                        <img
                                            src={heroImagePreview || heroImage}
                                            alt="Preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <svg className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}

                                <div className="text-center">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors text-balance px-4">
                                        {heroImage ? "Drag to Replace or Click to Browse" : "Drag Hero Image Here or Click to Select"}
                                    </p>
                                    {heroImage && (
                                        <p className="text-[9px] font-mono text-primary mt-1 truncate max-w-[200px] mx-auto">
                                            Current Path: {heroImage}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Input
                                id="hero-image-path"
                                value={heroImage}
                                onChange={(e) => setHeroImage(e.target.value)}
                                placeholder="/path/to/image.png"
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Main Glow Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={heroGlowHex}
                                        onChange={(e) => setHeroGlowHex(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{heroGlowHex}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Accent Orb Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={heroAccentHex}
                                        onChange={(e) => setHeroAccentHex(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{heroAccentHex}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Badge Dot Color (Alert)</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={badgeDotColor}
                                        onChange={(e) => setBadgeDotColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{badgeDotColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Badge Text Color</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={badgeTextColor}
                                        onChange={(e) => setBadgeTextColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                    />
                                    <span className="text-muted-foreground font-mono uppercase">{badgeTextColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="starting-price">Starting Price Text</Label>
                            <Input
                                id="starting-price"
                                value={startingPrice}
                                onChange={(e) => setStartingPrice(e.target.value)}
                                placeholder="e.g. L.E 599 or $89"
                            />
                            <p className="text-[10px] text-muted-foreground italic">This appears on the price sticker in the hero section.</p>
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save All Settings"}
                </Button>
            </form>

            <div className="space-y-2">
                <Label>Ribbon Live Preview</Label>
                {previewContainer && createPortal(
                    <div
                        style={{ backgroundColor: bgHex, color: textHex }}
                        className="relative w-full py-1.5 px-4 text-center text-[10px] font-bold uppercase tracking-widest break-words truncate overflow-hidden"
                    >
                        <div
                            className="absolute inset-0 blur-[2px] opacity-30 mix-blend-overlay pointer-events-none"
                            style={{ backgroundColor: shimmerHex }}
                        />
                        {text || "RIBBON PREVIEW..."}
                    </div>,
                    previewContainer
                )}
            </div>
        </div>
    );
}
