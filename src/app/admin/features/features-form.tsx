"use client";

import { useState, useRef } from "react";
import { setSetting, uploadFeatureImage } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Type, AlignLeft } from "lucide-react";

const FEATURE_KEYS = ["feature1", "feature2", "feature3", "feature4"];
const DEFAULT_NAMES = [
    "Signature Heavy Weave",
    "Premium Surface Finish",
    "Digital ID",
    "Sustainable Core"
];

interface FeatureSetting {
    title: string;
    description: string;
    image: string;
}

interface FeaturesSettings {
    [key: string]: FeatureSetting;
}

export function FeaturesForm({ initialSettings }: { initialSettings: FeaturesSettings }) {
    const [settings, setSettings] = useState<FeaturesSettings>(initialSettings || {});
    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
    const [loading, setLoading] = useState(false);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileSelect = (key: string, file: File) => {
        if (file) {
            setSelectedFiles(prev => ({ ...prev, [key]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [key]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const updateField = (key: string, field: keyof FeatureSetting, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || { title: "", description: "", image: "" }),
                [field]: value
            }
        }));
    };

    const removeImage = (key: string) => {
        updateField(key, "image", "");
        setPreviews(prev => ({ ...prev, [key]: null }));
        setSelectedFiles(prev => ({ ...prev, [key]: null }));
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const finalSettings = { ...settings };

        // Upload new files
        for (const key of FEATURE_KEYS) {
            const file = selectedFiles[key];
            const preview = previews[key];

            if (file && preview) {
                const uploadRes = await uploadFeatureImage(preview);
                if (uploadRes.success && uploadRes.path) {
                    finalSettings[key] = {
                        ...(finalSettings[key] || { title: "", description: "", image: "" }),
                        image: uploadRes.path
                    };
                } else {
                    toast.error(`Failed to upload image for ${finalSettings[key]?.title || key}`);
                    setLoading(false);
                    return;
                }
            }
        }

        const res = await setSetting("feature_settings", JSON.stringify(finalSettings));
        if (res.success) {
            toast.success("Feature settings updated successfully.");
            setSettings(finalSettings);
            setPreviews({});
            setSelectedFiles({});
        } else {
            toast.error(res.error || "Failed to save settings.");
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSave} className="space-y-8 bg-card border border-border p-6 rounded-xl">
            <div className="grid gap-12">
                {FEATURE_KEYS.map((key, index) => {
                    const feature = settings[key] || { title: DEFAULT_NAMES[index], description: "", image: "" };
                    return (
                        <div key={key} className="space-y-6 pb-8 border-b border-border last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg uppercase tracking-tighter text-primary">Feature {index + 1}</h3>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                        <Type className="w-3 h-3" />
                                        Title
                                    </Label>
                                    <Input
                                        value={feature.title}
                                        onChange={(e) => updateField(key, "title", e.target.value)}
                                        placeholder="Enter feature title..."
                                        className="font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                        <AlignLeft className="w-3 h-3" />
                                        Description
                                    </Label>
                                    <Textarea
                                        value={feature.description}
                                        onChange={(e) => updateField(key, "description", e.target.value)}
                                        placeholder="Enter feature description..."
                                        className="min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3" />
                                            Background Image
                                        </Label>
                                        {(previews[key] || feature.image) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeImage(key)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 px-2 text-[10px] uppercase font-bold"
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div
                                        className="group relative border-2 border-dashed border-border rounded-xl p-4 transition-colors hover:border-primary/50 flex flex-col items-center justify-center gap-3 bg-muted/50 cursor-pointer overflow-hidden min-h-[160px]"
                                        onClick={() => fileInputRefs.current[key]?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={(el) => { fileInputRefs.current[key] = el; }}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(key, file);
                                            }}
                                        />

                                        {previews[key] || feature.image ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-background">
                                                <img
                                                    src={previews[key] || feature.image}
                                                    alt={feature.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Change Image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-4">
                                                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    Click or drag to upload
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <Input
                                        value={feature.image || ""}
                                        onChange={(e) => updateField(key, "image", e.target.value)}
                                        placeholder="/path/to/image.png"
                                        className="bg-secondary/50 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 font-black uppercase tracking-widest text-sm">
                {loading ? "Saving & Uploading..." : "Update All Features"}
            </Button>
        </form>
    );
}
