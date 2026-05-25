"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getSetting } from "@/lib/actions/settings-actions";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

function parseRibbonSettings(raw: string, fallback: string) {
    try {
        return JSON.parse(raw);
    } catch {
        return JSON.parse(fallback);
    }
}

export function Ribbon() {
    const pathname = usePathname();
    const [settings, setSettings] = useState<{
        text: string,
        bgHex: string,
        textHex: string,
        shimmerHex?: string,
        active: boolean,
        timerActive?: boolean,
        timerEndDate?: string
    } | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        async function fetchRibbon() {
            // Determine which setting to use based on the path
            const isAboutOrShop = pathname === "/about" || pathname === "/shop";
            const settingKey = isAboutOrShop ? "new_releases_settings" : "ribbon_settings";

            const defaultValue = JSON.stringify({
                text: "",
                bgHex: isAboutOrShop ? "#000000" : "#ef4444",
                textHex: "#ffffff",
                shimmerHex: "#ffffff",
                active: false,
                timerActive: false,
                timerEndDate: "",
            });

            const ribbonSettingsRaw = await getSetting(settingKey, defaultValue);
            setSettings(parseRibbonSettings(ribbonSettingsRaw, defaultValue));
        }
        fetchRibbon();
    }, [pathname]);

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
                    {/* Glass glare effect for premium feel (Shaded Color) */}
                    <div
                        className="absolute inset-0 blur-[2px] opacity-30 mix-blend-overlay pointer-events-none"
                        style={{ backgroundColor: settings.shimmerHex || "rgba(255,255,255,0.1)" }}
                    />

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
                                    <div className="flex items-center shrink-0">
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.25em] drop-shadow-sm whitespace-nowrap shrink-0">
                                            {txt}
                                        </span>
                                        {settings.timerActive && settings.timerEndDate && (
                                            <CountdownTimer endDate={settings.timerEndDate} textHex={settings.textHex} />
                                        )}
                                    </div>
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

function CountdownTimer({ endDate, textHex }: { endDate: string, textHex: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const target = new Date(endDate).getTime();
        if (isNaN(target)) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    if (!isMounted) return null;

    const target = new Date(endDate).getTime();
    if (isNaN(target) || target - new Date().getTime() <= 0) return null;

    return (
        <span
            className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-xs font-bold leading-none px-2 py-1 rounded bg-black/10 tabular-nums shrink-0 ml-4 lg:ml-6 tracking-normal"
            style={{ color: textHex }}
        >
            {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
            <span>{timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}</span>
        </span>
    );
}

