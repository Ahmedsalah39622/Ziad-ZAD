"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

export function PageLoader() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const letters = "AZAD".split("");

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const letterVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white select-none overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex space-x-2"
                >
                    {letters.map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={letterVariants}
                            className="text-7xl md:text-9xl font-black text-black tracking-tighter"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
                    className="mt-6 h-1 w-32 bg-black origin-center"
                />
            </div>
        </div>
    );
}
