'use client';

import React from 'react';
import { Amulet } from '@/components/ui/amulet';

export default function DebugAmuletPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 space-y-12">
            <h1 className="text-white text-4xl font-bold mb-8">Ziad Zad Amulet Debug</h1>

            <div className="flex flex-wrap justify-center gap-16">
                <div className="flex flex-col items-center space-y-4">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm">Option 1: Mystical</span>
                    <Amulet size={400} variant="mystical" />
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm">Option 2: Streetwear</span>
                    <Amulet size={400} variant="streetwear" />
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm">Option 3: Signature</span>
                    <Amulet size={400} variant="signature" />
                </div>
            </div>

            {/* Scroll Assembly Section */}
            <div className="w-full mt-32 border-t border-zinc-800 pt-32">
                <div className="flex flex-col items-center space-y-4 mb-20">
                    <span className="text-zinc-500 uppercase tracking-widest text-sm">Option 4: Scroll Assembly</span>
                    <p className="text-zinc-400">Scroll down to see the calligraphy collect</p>
                </div>

                {/* Large height to allow for scroll state changes */}
                <div className="h-[200vh] flex flex-col items-center">
                    <div className="sticky top-1/2 -translate-y-1/2">
                        <Amulet size={500} variant="scroll-assembly" />
                    </div>
                </div>
            </div>

            <div className="max-w-2xl text-zinc-400 text-center mt-32 pb-32">
                <p>Move your mouse over the amulets to see the 3D parallax effect.</p>
                <p className="mt-2 italic">Animations include floating, pulse glow, and scroll-triggered assembly.</p>
            </div>
        </div>
    );
}
