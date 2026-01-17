'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LikertScaleProps {
    value: number;
    onChange: (value: number) => void;
    leftLabel?: string;
    rightLabel?: string;
    min?: number;
    max?: number;
    variant?: 'lantern' | 'flame' | 'night-bloom';
}

export default function LikertScale({ value, onChange, min = 1, max = 7, leftLabel = "Faint", rightLabel = "Matched", variant = 'lantern' }: LikertScaleProps) {
    const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    return (
        <div className="w-full flex flex-col items-center font-display relative pb-8">
            {/* SVG Filter for Watercolor Texture */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="watercolor-texture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                </filter>
            </svg>

            {/* The Hanging Branch Container */}
            <div className="relative w-full max-w-4xl h-48 flex items-center justify-center">
                {/* SVG Branch Decoration */}
                <svg className="absolute top-0 w-[110%] h-12 opacity-30 pointer-events-none" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path
                        d="M 0 20 Q 250 80 500 40 T 1000 60"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#watercolor-texture)"
                    />
                    {[200, 400, 600, 800].map(x => (
                        <path key={x} d={`M ${x} ${40 + Math.random() * 20} l ${10 + Math.random() * 10} ${10 + Math.random() * 20}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                    ))}
                </svg>

                {/* Lantern Row */}
                <div className="flex justify-between items-start w-full px-4 h-full pt-20">
                    {steps.map((num, i) => {
                        const isActive = value === num;
                        const isSelected = value >= num;

                        // Scale and progression
                        const scale = 1.1 + (i * 0.05); // 1.1 to 1.4
                        const cordLength = 10 + (i % 3) * 8; // Varied heights

                        return (
                            <button
                                key={num}
                                onClick={() => onChange(num)}
                                className="group relative flex flex-col items-center outline-none flex-1"
                            >
                                {/* Cord */}
                                <div
                                    className="w-[1px] bg-white/20 transition-all duration-700"
                                    style={{ height: `${cordLength}px` }}
                                />

                                {/* Lantern or Flame Variant */}
                                <motion.div
                                    className="relative flex items-center justify-center cursor-pointer"
                                    animate={isActive ? {
                                        rotate: [-1, 1, -1],
                                        scale: scale * 1.15
                                    } : {
                                        rotate: 0,
                                        scale: scale
                                    }}
                                    transition={{
                                        rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                        scale: { duration: 0.5 }
                                    }}
                                >
                                    {variant === 'lantern' ? (
                                        <svg
                                            width="50" height="80" viewBox="0 0 40 60"
                                            className={`transition-all duration-1000 overflow-visible
                                                ${isActive ? 'drop-shadow-[0_0_25px_rgba(255,200,50,0.6)]' : 'filter brightness-75'}
                                            `}
                                        >
                                            <defs>
                                                <radialGradient id={`glow-${num}`} cx="50%" cy="50%" r="50%">
                                                    <stop offset="0%" stopColor="rgba(255,240,150,1)" />
                                                    <stop offset="100%" stopColor="rgba(255,200,50,0)" />
                                                </radialGradient>
                                            </defs>
                                            <g filter="url(#watercolor-texture)">
                                                <circle cx="20" cy="5" r="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                                                <path d="M 8 15 L 20 8 L 32 15 L 32 18 L 8 18 Z" fill="rgba(80,80,80,0.8)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                                <rect x="10" y="18" width="20" height="28" fill={isActive ? `url(#glow-${num})` : (isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(20,20,20,0.4)')} className="transition-colors duration-1000" />
                                                <line x1="10" y1="18" x2="10" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                                <line x1="30" y1="18" x2="30" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                                <line x1="20" y1="18" x2="20" y2="46" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                                                {num > 3 && (<><line x1="15" y1="18" x2="15" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" /><line x1="25" y1="18" x2="25" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" /></>)}
                                                {num > 5 && (<path d="M 10 32 L 30 32 M 10 25 L 30 25 M 10 39 L 30 39" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />)}
                                                <rect x="8" y="46" width="24" height="4" fill="rgba(60,60,60,0.9)" rx="1" />
                                            </g>
                                            {isActive && (
                                                <motion.circle cx="20" cy="32" r="2" fill="white" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} className="shadow-[0_0_10px_white]" />
                                            )}
                                        </svg>
                                    ) : variant === 'flame' ? (
                                        <svg
                                            width="60" height="100" viewBox="0 0 40 70"
                                            className="overflow-visible"
                                        >
                                            <defs>
                                                <linearGradient id={`flame-grad-${num}`} x1="0%" y1="100%" x2="0%" y2="0%">
                                                    <stop offset="0%" stopColor="#FF4500" /> {/* Red-Orange */}
                                                    <stop offset="50%" stopColor="#FF8C00" /> {/* Dark Orange */}
                                                    <stop offset="100%" stopColor="#FFD700" /> {/* Gold */}
                                                </linearGradient>
                                                <filter id="flame-blur">
                                                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                                                </filter>
                                            </defs>

                                            {/* Candle Base (Stick) */}
                                            <rect x="18" y="55" width="4" height="12" rx="1" fill="rgba(80,80,80,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                                            {/* Wick */}
                                            <line x1="20" y1="52" x2="20" y2="55" stroke="#444" strokeWidth="1.5" />

                                            {/* Flame Core */}
                                            <motion.path
                                                d="M20 52 Q10 42 10 27 Q10 7 20 -1 Q30 7 30 27 Q30 42 20 52"
                                                fill={`url(#flame-grad-${num})`}
                                                filter={(isActive || isSelected) ? "url(#flame-blur)" : ""}
                                                initial={false}
                                                animate={isActive ? {
                                                    d: [
                                                        "M20 52 Q10 42 10 27 Q10 7 20 -1 Q30 7 30 27 Q30 42 20 52",
                                                        "M20 52 Q8 41 8 26 Q8 6 20 0 Q32 6 32 26 Q32 41 20 52",
                                                        "M20 52 Q10 42 10 27 Q10 7 20 -1 Q30 7 30 27 Q30 42 20 52"
                                                    ],
                                                    scale: [0, 1.5, 1],
                                                    opacity: 1,
                                                    y: 0
                                                } : (isSelected ? {
                                                    scale: 1,
                                                    opacity: 0.8,
                                                    y: 0,
                                                    d: "M20 52 Q10 42 10 27 Q10 7 20 -1 Q30 7 30 27 Q30 42 20 52"
                                                } : {
                                                    scale: 0,
                                                    opacity: 0,
                                                    y: 10
                                                })}
                                                transition={isActive ? {
                                                    d: { duration: 0.8, repeat: Infinity, ease: "linear" },
                                                    scale: { duration: 0.4, ease: "backOut" },
                                                    opacity: { duration: 0.2 },
                                                    y: { duration: 0.3 }
                                                } : { duration: 0.3 }}
                                                className={`opacity-95 transition-all duration-700
                                                    ${isActive ? 'drop-shadow-[0_0_40px_rgba(255,140,50,1)]' : (isSelected ? 'drop-shadow-[0_0_20px_rgba(255,100,20,0.5)]' : '')}
                                                `}
                                            />

                                            {/* Inner Flame (White Hot) */}
                                            {(isActive || isSelected) && (
                                                <motion.path
                                                    d="M20 48 Q15 38 15 30 Q15 18 20 13 Q25 18 25 30 Q25 38 20 48"
                                                    fill="#FFF"
                                                    className="opacity-90 mix-blend-overlay"
                                                    initial={{ scale: 0 }}
                                                    animate={isActive ? {
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.8, 1, 0.8]
                                                    } : {
                                                        scale: 1,
                                                        opacity: 0.6
                                                    }}
                                                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                            )}

                                            {/* Floating Embers */}
                                            {isActive && (
                                                <>
                                                    <motion.circle cx="18" cy="25" r="2" fill="#FFD700" animate={{ y: -30, opacity: 0, scale: [1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }} />
                                                    <motion.circle cx="22" cy="30" r="1.5" fill="#FFA500" animate={{ y: -25, opacity: 0, scale: [1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                                                    <motion.circle cx="20" cy="15" r="3" fill="#FFFFFF" animate={{ y: -35, opacity: 0, scale: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="blur-[1.5px]" />
                                                </>
                                            )}
                                        </svg>
                                    ) : (
                                        <svg
                                            width="110" height="120" viewBox="0 0 100 110"
                                            className="overflow-visible"
                                        >
                                            <defs>
                                                {/* Sketchbook Graphite & Rose Palette */}
                                                <linearGradient id={`sketch-petal-${num}`} x1="0%" y1="100%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#2A2A2A" />
                                                    <stop offset="60%" stopColor="#4A4A4A" />
                                                    <stop offset="100%" stopColor="#757575" />
                                                </linearGradient>

                                                <linearGradient id={`sketch-rose-${num}`} x1="0%" y1="100%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3D2024" />
                                                    <stop offset="50%" stopColor="#824651" />
                                                    <stop offset="100%" stopColor="#A35D6A" />
                                                </linearGradient>

                                                <radialGradient id={`sketch-stamen-${num}`}>
                                                    <stop offset="0%" stopColor="#FDE68A" />
                                                    <stop offset="70%" stopColor="#D97706" />
                                                    <stop offset="100%" stopColor="#92400E" stopOpacity="0" />
                                                </radialGradient>

                                                <pattern id={`hatching-${num}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                                                    <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
                                                </pattern>
                                            </defs>

                                            {/* Hand-drawn Pencil Stem */}
                                            <path d="M50 105 Q52 95 50 85" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />

                                            <motion.g
                                                animate={isActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                style={{ originX: '50px', originY: '85px' }}
                                            >
                                                {/* Back Layers - Sketchbook Paths */}
                                                {[
                                                    { d: "M50 85 C25 80 10 50 12 30 C18 10 38 10 50 85", r: -38, rose: false },
                                                    { d: "M50 85 C75 80 90 50 88 30 C82 10 62 10 50 85", r: 38, rose: true }
                                                ].map((p, i) => (
                                                    <motion.path
                                                        key={`bp-${i}`} d={p.d}
                                                        fill={p.rose ? `url(#sketch-rose-${num})` : `url(#sketch-petal-${num})`}
                                                        stroke="#111" strokeWidth="0.5"
                                                        animate={isActive ? { rotate: p.r * 1.6, opacity: 0.6 } : { rotate: p.r * 0.1, opacity: 0.45 }}
                                                        transition={{ duration: 2 }}
                                                        style={{ originX: '50px', originY: '85px' }}
                                                    />
                                                ))}

                                                {/* Golden Stamen (Core of the Bloom) */}
                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mix-blend-multiply">
                                                            <circle cx="50" cy="58" r="9" fill={`url(#sketch-stamen-${num})`} />
                                                            {[...Array(10)].map((_, i) => (
                                                                <line key={i} x1="50" y1="58" x2={50 + Math.cos(i) * 12} y2={58 + Math.sin(i) * 12} stroke="#92400E" strokeWidth="0.4" opacity="0.3" />
                                                            ))}
                                                        </motion.g>
                                                    )}
                                                </AnimatePresence>

                                                {/* Main Illustrated Petals */}
                                                {[
                                                    { d: "M50 85 C32 80 18 60 22 35 C28 15 45 12 50 85", r: -8, rose: false },
                                                    { d: "M50 85 C68 80 82 60 78 35 C72 15 55 12 50 85", r: 8, rose: true },
                                                    { d: "M50 85 C42 65 35 40 50 2 C65 40 58 65 50 85", r: 0, rose: false }
                                                ].map((p, i) => (
                                                    <motion.g key={`mp-${i}`} style={{ originX: '50px', originY: '85px' }} animate={isActive ? { rotate: p.r * 3.5, y: -2 } : { rotate: p.r * 0.2, y: 0 }}>
                                                        <path d={p.d} fill={p.rose ? `url(#sketch-rose-${num})` : "#4A4A4A"} stroke="#000" strokeWidth="1.1" />
                                                        <path d={p.d} fill={`url(#hatching-${num})`} opacity="0.4" />
                                                        <path d={p.d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className="mix-blend-overlay" />
                                                    </motion.g>
                                                ))}

                                                {/* Protective Bud Petal - The Closed State */}
                                                <motion.path
                                                    d="M50 85 C42 75 42 45 50 22 C58 45 58 75 50 85"
                                                    fill="#333" stroke="#000" strokeWidth="0.8"
                                                    animate={isActive ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                                                />
                                            </motion.g>

                                            {/* Subtle Graphite Dust */}
                                            {isActive && (
                                                <g>
                                                    {[...Array(4)].map((_, i) => (
                                                        <motion.circle
                                                            key={i} cx="50" cy="55" r="0.6" fill="#D97706"
                                                            animate={{ y: [-5, -75], opacity: [0, 0.6, 0] }}
                                                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                                                        />
                                                    ))}
                                                </g>
                                            )}
                                        </svg>
                                    )}

                                    {/* Number label */}
                                    <span className={`absolute -bottom-10 text-sm font-black italic tracking-[0.2em] transition-opacity
                                        ${isActive ? 'text-white opacity-100 scale-110' : 'text-white/40 group-hover:opacity-80'}
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
            <div className="flex justify-between items-center w-full max-w-4xl px-8 mt-8 relative z-10">
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
