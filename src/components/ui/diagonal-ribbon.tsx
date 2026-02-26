import React from 'react';

interface DiagonalRibbonProps {
    text: string;
    color?: string;
    position?: 'top-left' | 'top-right';
}

export function DiagonalRibbon({ text, color = '#ef4444', position = 'top-left' }: DiagonalRibbonProps) {
    const isTopLeft = position === 'top-left';

    return (
        <div className={`absolute top-0 ${isTopLeft ? 'left-0' : 'right-0'} z-30 pointer-events-none w-28 h-28 overflow-hidden select-none`}>
            <div
                className={`absolute w-[150%] h-7 flex items-center justify-center shadow-xl transform transition-transform duration-500
          ${isTopLeft
                        ? 'top-[22px] left-[-45px] -rotate-45'
                        : 'top-[22px] right-[-45px] rotate-45'
                    }`}
                style={{
                    backgroundColor: color,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.15), rgba(0,0,0,0.1))'
                }}
            >
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white py-1 filter drop-shadow-md">
                    {text}
                </span>

                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            </div>
        </div>
    );
}
