"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getSetting } from "@/lib/actions/settings-actions";

export function Ribbon() {
    const [settings, setSettings] = useState<{ text: string, bgHex: string, textHex: string, active: boolean } | null>(null);

    useEffect(() => {
        async function fetchRibbon() {
            const ribbonSettingsRaw = await getSetting("ribbon_settings", JSON.stringify({
                text: "",
                bgHex: "#ef4444",
                textHex: "#ffffff",
                active: false,
            }));
            setSettings(JSON.parse(ribbonSettingsRaw));
        }
        fetchRibbon();
    }, []);

    if (!settings || !settings.active || !settings.text) {
        return null;
    }

    return (
        <div
            className={cn(
                "w-full py-1.5 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest leading-normal transition-all duration-300",
                "relative z-[60] overflow-hidden drop-shadow-sm select-none animate-in fade-in"
            )}
            style={{
                backgroundColor: settings.bgHex,
                color: settings.textHex
            }}
        >
            {settings.text}
        </div>
    );
}
