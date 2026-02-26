"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function PageLoader() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Paths extracted directly from logo.svg for Z, A, D
    const letters = {
        Z: [
            "M0 12.6602V13.3638C0.430203 13.3639 0.856172 13.4483 1.25354 13.6119C1.65092 13.7755 2.01192 14.0154 2.3159 14.3176C2.61987 14.6199 2.86088 14.9787 3.02513 15.3735C3.18938 15.7683 3.27365 16.1913 3.27314 16.6185H3.92823C3.92845 15.7566 4.27336 14.9301 4.88715 14.3206C5.50093 13.7112 6.33335 13.3687 7.20137 13.3685V12.6649C6.77117 12.6648 6.3452 12.5805 5.94783 12.4169C5.55046 12.2532 5.18945 12.0135 4.88547 11.7111C4.58149 11.4089 4.34049 11.0502 4.17624 10.6554C4.012 10.2606 3.92772 9.83751 3.92823 9.41037H3.27314C3.27293 10.2722 2.92801 11.0987 2.31423 11.7081C1.70044 12.3176 0.868026 12.66 0 12.6602Z",
            "M8.90289 8.19H3.27314V6.10962H8.90289C12.8571 6.10962 15.9736 9.20473 15.9736 13.0003C15.9736 16.7959 12.8571 19.8902 8.90289 19.8902H5.62976V25.9999H3.27314V17.8099H8.90289C11.6532 17.8099 13.6169 15.8609 13.6169 13.0003C13.6169 10.1398 11.6525 8.19 8.90289 8.19Z"
        ],
        A: [
            "M24.4315 6.08383C20.5552 6.08383 17.2821 9.12657 17.2821 13.0003C17.2821 16.8741 20.5552 19.9161 24.4315 19.9161C26.4739 19.9161 28.3038 18.8794 29.4849 17.2377V19.5002H31.8416V6.49975H29.4849V8.76224C28.3329 7.12361 26.4999 6.08383 24.4315 6.08383ZM24.4315 8.16416C27.4952 8.16416 29.4849 10.2179 29.4849 13.0003C29.4849 15.7562 27.4684 17.8357 24.4315 17.8357C21.708 17.8357 19.6387 15.8867 19.6387 13.0003C19.6387 10.114 21.708 8.16416 24.4315 8.16416Z"
        ],
        D: [
            "M40.5611 6.08389C42.6303 6.08389 44.4633 7.12367 45.6152 8.76232V0H47.9719V19.5002H45.6152V17.2377C44.4633 18.8795 42.6303 19.9161 40.5611 19.9161C36.6855 19.9161 33.4124 16.8742 33.4124 13.0004C33.4124 9.12665 36.6855 6.08389 40.5611 6.08389ZM40.5611 17.8358C43.6248 17.8358 45.6152 15.782 45.6152 13.0004C45.6152 10.2188 43.6248 8.16424 40.5611 8.16424C37.8383 8.16424 35.769 10.114 35.769 13.0004C35.769 15.8867 37.8383 17.8358 40.5611 17.8358Z"
        ]
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white select-none overflow-hidden">
            {/* Background Texture/Grain */}
            <div
                className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />

            {/* Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-black/5 blur-[120px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex items-center justify-center"
                >
                    <svg
                        width="240"
                        height="80"
                        viewBox="0 0 86 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="overflow-visible"
                    >
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Letter Z */}
                        {letters.Z.map((path, i) => (
                            <motion.path
                                key={`z-${i}`}
                                d={path}
                                stroke="black"
                                strokeWidth="0.75"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 1],
                                    fill: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,1)"]
                                }}
                                transition={{
                                    duration: 2.5,
                                    times: [0, 0.6, 1],
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    delay: i * 0.1
                                }}
                                filter="url(#glow)"
                            />
                        ))}

                        {/* Letter A */}
                        {letters.A.map((path, i) => (
                            <motion.path
                                key={`a-${i}`}
                                d={path}
                                stroke="black"
                                strokeWidth="0.75"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 1],
                                    fill: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,1)"]
                                }}
                                transition={{
                                    duration: 2.5,
                                    times: [0, 0.6, 1],
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    delay: 0.4 + i * 0.1
                                }}
                                filter="url(#glow)"
                            />
                        ))}

                        {/* Letter D */}
                        {letters.D.map((path, i) => (
                            <motion.path
                                key={`d-${i}`}
                                d={path}
                                stroke="black"
                                strokeWidth="0.75"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 1],
                                    fill: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,1)"]
                                }}
                                transition={{
                                    duration: 2.5,
                                    times: [0, 0.6, 1],
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    delay: 0.8 + i * 0.1
                                }}
                                filter="url(#glow)"
                            />
                        ))}
                    </svg>
                </motion.div>

                {/* Refinement: Progress Bar */}
                <div className="mt-16 overflow-hidden w-64 h-[1px] bg-black/10 relative">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            repeat: Infinity
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent"
                    />
                </div>

                {/* Subtitle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-8 flex flex-col items-center space-y-2"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/60">
                        Ziad-ZAD Premium
                    </span>
                    <div className="flex space-x-4">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-1 bg-black rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Corner Markers */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className="absolute top-12 left-12 w-6 h-[1px] bg-black/20" />
                <div className="absolute top-12 left-12 w-[1px] h-6 bg-black/20" />

                <div className="absolute top-12 right-12 w-6 h-[1px] bg-black/20" />
                <div className="absolute top-12 right-12 w-[1px] h-6 bg-black/20" />

                <div className="absolute bottom-12 left-12 w-6 h-[1px] bg-black/20" />
                <div className="absolute bottom-12 left-12 w-[1px] h-6 bg-black/20" />

                <div className="absolute bottom-12 right-12 w-6 h-[1px] bg-black/20" />
                <div className="absolute bottom-12 right-12 w-[1px] h-6 bg-black/20" />
            </motion.div>
        </div>
    );
}
