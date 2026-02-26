"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function Hero3DShirt({ image, glowColor }: { image: string, glowColor: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-1, 1], ["30deg", "-30deg"]);
    const rotateY = useTransform(mouseXSpring, [-1, 1], ["-30deg", "30deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current || isDragging) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width - 0.5) * 2;
        const yPct = (mouseY / height - 0.5) * 2;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        if (!isDragging) {
            x.set(0);
            y.set(0);
        }
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => {
                setIsDragging(false);
                x.set(0);
                y.set(0);
            }}
            onDrag={(e, info) => {
                // Map drag offset to rotation
                const dragX = info.offset.x / 100;
                const dragY = info.offset.y / 100;
                x.set(dragX);
                y.set(dragY);
            }}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative h-[500px] w-full max-w-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 z-50"
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
                {/* Main Shirt Asset */}
                <div className="relative w-[130%] h-[130%] flex items-center justify-center transition-transform duration-500">
                    <img
                        src={image}
                        alt="ZAD Genesis Shirt"
                        className="w-full h-full object-contain filter contrast-110 saturate-110"
                        style={{
                            filter: `drop-shadow(0 35px 60px ${glowColor}66)`
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
