"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function Hero3DShirt() {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative h-[500px] w-full max-w-[600px] flex items-center justify-center cursor-pointer perspective-1000 z-50"
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full flex items-center justify-center"
            >
                {/* Main Shirt Asset - Floating Freely, No Container card */}
                {/* Scaled up for impact, clean drop shadow for depth */}
                <div className="relative w-[130%] h-[130%] flex items-center justify-center drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-110">
                    <img
                        src="/zad_green_shirt_studio.png"
                        alt="ZAD Genesis Green Shirt"
                        className="w-full h-full object-contain filter contrast-110 saturate-110"
                    />
                </div>
            </div>
        </motion.div>
    );
}
