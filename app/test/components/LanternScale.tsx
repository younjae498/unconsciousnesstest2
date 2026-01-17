import React from 'react';
import { motion } from 'framer-motion';

interface LanternScaleProps {
    min?: number;
    max?: number;
    value: number | null;
    onChange: (value: number) => void;
    labels?: { min?: string; max?: string };
}

export default function LanternScale({
    min = 1,
    max = 7,
    value,
    onChange,
    labels = { min: '전혀 그렇지 않음', max: '매우 그렇다' }
}: LanternScaleProps) {
    const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    // Map props to LikertScale style labels
    const leftLabel = labels.min;
    const rightLabel = labels.max;

    return (
        <div className="w-full flex flex-col items-center font-display relative pb-8 mt-4">
            {/* SVG Filter for Watercolor Texture (Copied from LikertScale) */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="lantern-texture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                </filter>
            </svg>

            {/* The Hanging Branch Container */}
            <div className="relative w-full max-w-2xl h-48 flex items-center justify-center">

                {/* SVG Branch Decoration (From LikertScale) */}
                <svg className="absolute top-0 w-[110%] h-12 opacity-30 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path
                        d="M 0 20 Q 250 80 500 40 T 1000 60"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#lantern-texture)"
                    />
                    {[200, 400, 600, 800].map(x => (
                        <path key={x} d={`M ${x} ${40 + Math.random() * 20} l ${10 + Math.random() * 10} ${10 + Math.random() * 20}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                    ))}
                </svg>

                {/* Lantern Row */}
                <div className="flex justify-between items-start w-full px-4 h-full pt-8">
                    {steps.map((num, i) => {
                        const isActive = value === num;
                        const isSelected = (value !== null) && (value >= num);

                        // Scale and progression
                        const scale = 0.85 + (i * 0.05); // 0.85 to 1.15
                        const cordLength = 20 + (i % 3) * 10; // Varied heights

                        return (
                            <button
                                key={num}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(num);
                                }}
                                className="group relative flex flex-col items-center outline-none flex-1 h-full touch-manipulation cursor-pointer z-[100]"
                            >
                                {/* Cord */}
                                <div
                                    className="w-[1px] bg-white/30 transition-all duration-700"
                                    style={{ height: `${cordLength}px` }}
                                />

                                {/* Lantern Aspect */}
                                <motion.div
                                    className="relative flex items-center justify-center"
                                    animate={isActive ? {
                                        rotate: [-2, 2, -2],
                                        scale: scale * 1.1
                                    } : {
                                        rotate: 0,
                                        scale: scale
                                    }}
                                    transition={{
                                        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                        scale: { duration: 0.5 }
                                    }}
                                >
                                    <svg
                                        width="40" height="60" viewBox="0 0 40 60"
                                        className={`transition-all duration-1000 overflow-visible
                                            ${isActive ? 'drop-shadow-[0_0_20px_rgba(255,200,50,0.6)]' : 'filter brightness-75'}
                                        `}
                                    >
                                        <defs>
                                            <radialGradient id={`lantern-glow-${num}`} cx="50%" cy="50%" r="50%">
                                                <stop offset="0%" stopColor="rgba(255,240,150,1)" />
                                                <stop offset="100%" stopColor="rgba(255,200,50,0)" />
                                            </radialGradient>
                                        </defs>

                                        {/* Iron Frame - watercolor texture applied */}
                                        <g filter="url(#lantern-texture)">
                                            {/* Top Hook */}
                                            <circle cx="20" cy="5" r="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                                            {/* Cap */}
                                            <path d="M 8 15 L 20 8 L 32 15 L 32 18 L 8 18 Z" fill="rgba(80,80,80,0.8)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

                                            {/* Glass Body */}
                                            <rect
                                                x="10" y="18" width="20" height="28"
                                                fill={isActive ? `url(#lantern-glow-${num})` : (isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(20,20,20,0.4)')}
                                                className="transition-colors duration-1000"
                                            />

                                            {/* Iron Bars - More bars as number increases */}
                                            <line x1="10" y1="18" x2="10" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                            <line x1="30" y1="18" x2="30" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                            <line x1="20" y1="18" x2="20" y2="46" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                                            {num > 3 && (
                                                <>
                                                    <line x1="15" y1="18" x2="15" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                                                    <line x1="25" y1="18" x2="25" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                                                </>
                                            )}
                                            {num > 5 && (
                                                <path d="M 10 32 L 30 32 M 10 25 L 30 25 M 10 39 L 30 39" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                                            )}

                                            {/* Base */}
                                            <rect x="8" y="46" width="24" height="4" fill="rgba(60,60,60,0.9)" rx="1" />
                                        </g>

                                        {/* Internal Flame Sparkle if active */}
                                        {isActive && (
                                            <motion.circle
                                                cx="20" cy="32" r="2"
                                                fill="white"
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="shadow-[0_0_10px_white]"
                                            />
                                        )}
                                    </svg>

                                    {/* Number label inside/under lantern - Matched to LikertScale */}
                                    <span className={`absolute -bottom-8 text-xs font-black italic tracking-widest transition-opacity
                                        ${isActive ? 'text-white opacity-100' : 'text-white/40 group-hover:opacity-80'}
                                    `}>
                                        {num}
                                    </span>
                                </motion.div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Narrative Labels */}
            <div className="flex justify-between items-center w-full max-w-2xl px-8 mt-2 relative z-10 opacity-70">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-display font-black tracking-[0.2em] text-white/80 uppercase italic">{leftLabel}</span>
                    <div className="w-12 h-[1px] bg-white/30" />
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-display font-black tracking-[0.2em] text-white/80 uppercase italic">{rightLabel}</span>
                    <div className="w-12 h-[1px] bg-white/30" />
                </div>
            </div>
        </div>
    );
}
