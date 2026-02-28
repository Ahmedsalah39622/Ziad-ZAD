'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll } from 'framer-motion';

interface AmuletProps {
    className?: string;
    size?: number;
    glowColor?: string;
    variant?: 'mystical' | 'streetwear' | 'signature' | 'scroll-assembly';
}

interface ScrollAmuletProps {
    className?: string;
    size?: number;
}

// New ScrollAmulet component with improved slice assembly
function ScrollAmulet({ className = '', size = 300 }: ScrollAmuletProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const numSlices = 7; // More slices for better detail
    const sliceHeightPct = 100 / numSlices;

    const sliceElements = Array.from({ length: numSlices }).map((_, i) => {
        // Individual start/end points for staggered assembly
        const start = (i / numSlices) * 0.4;
        const end = start + 0.4;

        // X movement (fly in from alternating sides)
        const x = useTransform(
            scrollYProgress,
            [start, end],
            [i % 2 === 0 ? '-100px' : '100px', '0px']
        );

        // Opacity reveal
        const opacity = useTransform(
            scrollYProgress,
            [start, end],
            [0, 1]
        );

        // Rotation for a 'floating assembly' look
        const rotate = useTransform(
            scrollYProgress,
            [start, end],
            [i % 2 === 0 ? -20 : 20, 0]
        );

        return (
            <motion.div
                key={i}
                className="absolute inset-x-0 overflow-hidden"
                style={{
                    top: `${i * sliceHeightPct}%`,
                    height: `${sliceHeightPct + 0.5}%`, // Tiny overlap
                    x,
                    opacity,
                    rotate,
                }}
            >
                <div
                    className="relative w-full h-full"
                    style={{
                        height: size, // Total height of the original image relative to the container
                        marginTop: `-${i * (size / numSlices)}px`,
                    }}
                >
                    <Image
                        src="/amulet-logo.png"
                        alt="Ziad Zad Amulet Slice"
                        width={size}
                        height={size}
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>
            </motion.div>
        );
    });

    return (
        <div
            ref={ref}
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size * 1.5 }} // More height for vertical presence
        >
            <div className="sticky top-1/2 -translate-y-1/2 w-full h-full max-h-[400px]">
                {sliceElements}
            </div>
        </div>
    );
}


export function Amulet({
    className = '',
    size = 300,
    glowColor = 'rgba(255, 255, 255, 0.4)',
    variant = 'mystical'
}: AmuletProps) {
    if (variant === 'scroll-assembly') {
        return <ScrollAmulet className={className} size={size} />;
    }

    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse movement for 3D parallax
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    const isStreetwear = variant === 'streetwear';
    const isMystical = variant === 'mystical';
    const isSignature = variant === 'signature';

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size, perspective: '1000px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Glow (Mystical Energy) */}
            {isMystical && (
                <motion.div
                    className="absolute inset-0 rounded-full blur-[60px]"
                    animate={{
                        scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
                        opacity: isHovered ? 0.8 : 0.4,
                        backgroundColor: glowColor,
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            {/* Streetwear Background (Glassmorphism Medallion) */}
            {isStreetwear && (
                <motion.div
                    className="absolute inset-[10%] rounded-full border border-white/20 backdrop-blur-md bg-white/5 shadow-2xl overflow-hidden"
                    animate={{
                        borderColor: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                        backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        boxShadow: isHovered ? '0 0 30px rgba(255,255,255,0.2)' : '0 0 10px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Metallic Rim Glow */}
                    <div className="absolute inset-0 rounded-full border-[2px] border-white/10 pointer-events-none" />
                </motion.div>
            )}

            {/* Signature Background (Ink Blot / Smoke) */}
            {isSignature && (
                <motion.div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: isHovered ? 1.5 : 1,
                        opacity: isHovered ? 0.4 : 0.2,
                        filter: isHovered ? 'blur(20px)' : 'blur(40px)',
                    }}
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                    }}
                />
            )}

            {/* Floating Medallion Content */}
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
                animate={{
                    y: isHovered ? [0, -15, 0] : [0, -10, 0],
                    scale: isSignature && isHovered ? 1.05 : 1,
                }}
                transition={{
                    y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
                className={`relative w-full h-full p-12 flex items-center justify-center ${isMystical ? 'drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : ''}`}
            >
                {/* Image Component with Signature Reveal */}
                <motion.div
                    className="relative w-full h-full"
                    style={{ transform: 'translateZ(50px)' }}
                    initial={isSignature ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
                    animate={isSignature ? { clipPath: 'inset(0% 0% 0% 0%)' } : false}
                    transition={isSignature ? { duration: 1.5, ease: "circOut" } : {}}
                >
                    <Image
                        src="/amulet-logo.png"
                        alt="Ziad Zad Amulet"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* Shimmer Effect (Only for Streetwear and Mystical) */}
                {!isSignature && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 60%, transparent 100%)',
                            backgroundSize: '250% 250%',
                            zIndex: 20,
                            transform: 'translateZ(60px)',
                        }}
                        animate={{
                            backgroundPosition: isHovered ? ['300% 300%', '-100% -100%'] : ['200% 200%', '-50% -50%']
                        }}
                        transition={{
                            duration: isHovered ? 2 : 4,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: isHovered ? 0.5 : 3
                        }}
                    />
                )}

                {/* Signature Ink Reveal Particle (Simulated) */}
                {isSignature && isHovered && (
                    <motion.div
                        className="absolute w-2 h-2 bg-white rounded-full blur-sm"
                        animate={{
                            x: [0, 100, -100, 0],
                            y: [0, -100, 100, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.div>
        </div>
    );
}
