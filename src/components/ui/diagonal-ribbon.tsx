import React from 'react';
import Image from 'next/image';

interface DiagonalRibbonProps {
    text: string;
    color?: string;
    position?: 'top-left' | 'top-right';
}

export function DiagonalRibbon({ position = 'top-left' }: DiagonalRibbonProps) {
    const isTopLeft = position === 'top-left';

    // Using the user-provided image for the ribbon
    return (
        <div
            className={`absolute z-30 pointer-events-none select-none`}
            style={{
                top: '-5px', // Sit tight to the corner
                [isTopLeft ? 'left' : 'right']: '-5px',
                width: '100px', // Scaling down to be small and unintrusive
                height: '100px',
                transform: isTopLeft ? 'none' : 'scaleX(-1)'
            }}
        >
            <div className="relative w-full h-full">
                <Image
                    src="/discount-ribbon.png"
                    alt="Discount Ribbon"
                    fill
                    className="object-contain drop-shadow-2xl"
                />
            </div>
        </div>
    );
}
