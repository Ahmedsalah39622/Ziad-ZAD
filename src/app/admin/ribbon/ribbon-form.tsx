"use client";

import { useState } from "react";
import { setSetting } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useEffect } from "react";

interface RibbonSettings {
    text: string;
    bgHex: string;
    textHex: string;
    active: boolean;
    timerActive?: boolean;
    timerEndDate?: string;
}

export function RibbonForm({ initialSettings }: { initialSettings: RibbonSettings }) {
    const [text, setText] = useState(initialSettings.text || "");
    const [bgHex, setBgHex] = useState(initialSettings.bgHex || "#ef4444");
    const [textHex, setTextHex] = useState(initialSettings.textHex || "#ffffff");
    const [active, setActive] = useState(initialSettings.active ?? false);
    const [timerActive, setTimerActive] = useState(initialSettings.timerActive ?? false);
    const [timerEndDate, setTimerEndDate] = useState(initialSettings.timerEndDate || "");
    const [loading, setLoading] = useState(false);
    const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPreviewContainer(document.getElementById("ribbon-preview-container"));
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const payload = JSON.stringify({
            text,
            bgHex,
            textHex,
            active,
            timerActive,
            timerEndDate,
        });

        const res = await setSetting("ribbon_settings", payload);
        if (res.success) {
            toast.success("Ribbon settings updated successfully.");
        } else {
            toast.error(res.error || "Failed to save.");
        }

        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6 bg-card border border-border p-6 rounded-xl">
                {/* Toggle Active */}
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="space-y-1">
                        <Label className="font-bold">Enable Ribbon</Label>
                        <p className="text-sm text-muted-foreground">
                            Turn on to show the badge globally across the shop and home pages.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-5 h-5 accent-primary"
                            title="Enable Ribbon"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <Label htmlFor="ribbon-text">Ribbon Text</Label>
                    <Input
                        id="ribbon-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. GET 20% OFF ALL PRODUCTS!"
                    />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col items-start font-medium text-sm">
                        <Label>Background Color</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={bgHex}
                                onChange={(e) => setBgHex(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                title="Background Color"
                            />
                            <span className="text-muted-foreground font-mono uppercase">{bgHex}</span>
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col items-start font-medium text-sm">
                        <Label>Text Color</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={textHex}
                                onChange={(e) => setTextHex(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer shrink-0 border-0 p-0"
                                title="Text Color"
                            />
                            <span className="text-muted-foreground font-mono uppercase">{textHex}</span>
                        </div>
                    </div>
                </div>

                {/* Timer Settings */}
                <div className="space-y-4 border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="font-bold">Enable Countdown Timer</Label>
                            <p className="text-sm text-muted-foreground">
                                Show a countdown timer next to the ribbon text.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={timerActive}
                            onChange={(e) => setTimerActive(e.target.checked)}
                            className="w-5 h-5 accent-primary"
                            title="Enable Timer"
                        />
                    </div>

                    {timerActive && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="timer-end-date">End Date & Time</Label>
                            <Input
                                id="timer-end-date"
                                type="datetime-local"
                                value={timerEndDate}
                                onChange={(e) => setTimerEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save Settings"}
                </Button>
            </form>

            {/* Render the preview instantly */}
            {previewContainer && createPortal(
                <div style={{ backgroundColor: bgHex, color: textHex }} className="w-full py-1.5 px-4 text-center text-[10px] font-bold uppercase tracking-widest break-words truncate">
                    {text || "RIBBON PREVIEW..."}
                </div>,
                previewContainer
            )}
        </div>
    );
}
