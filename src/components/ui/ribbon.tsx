"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getSetting } from "@/lib/actions/settings-actions";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Ribbon() {
    const [settings, setSettings] = useState<{ text: string, bgHex: string, textHex: string, active: boolean } | null>(null);
    const [isVisible, setIsVisible] = useState(true);

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

    if (!settings || !settings.active || !settings.text || !isVisible) {
        return null;
    }

    // Create an array for seamless infinite marquee scrolling
    const duplicateTexts = Array(10).fill(settings.text);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                        "relative w-full overflow-hidden flex items-center justify-center drop-shadow-md select-none border-b border-foreground/10",
                    )}
                    style={{
                        backgroundColor: settings.bgHex,
                        color: settings.textHex
                    }}
                >
                    {/* Glass glare effect for premium feel */}
                    <div className="absolute inset-0 bg-white/10 blur-[2px] opacity-30 mix-blend-overlay pointer-events-none" />

                    {/* Marquee Wrapper */}
                    <div className="relative flex w-full overflow-hidden py-2 md:py-2.5">
                        <motion.div
                            className="flex whitespace-nowrap items-center gap-12 sm:gap-16 px-4"
                            animate={{
                                x: ["0%", "-50%"]
                            }}
                            transition={{
                                duration: 25,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            {duplicateTexts.map((txt, i) => (
                                <div key={i} className="flex items-center gap-12 sm:gap-16">
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.25em] drop-shadow-sm whitespace-nowrap shrink-0">
                                        {txt}
                                    </span>
                                    {/* Small decorative dot separator */}
                                    <span
                                        className="w-1 h-1 rounded-full opacity-40 shrink-0"
                                        style={{ backgroundColor: settings.textHex }}
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Close Button for interaction */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 transition-all duration-300"
                        aria-label="Close announcement"
                    >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: settings.textHex }} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
