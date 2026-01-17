import React from 'react';
import { motion } from 'framer-motion';

interface MoonPhaseProps {
    progress: number; // 0 to 1 (0 = new moon, 1 = full moon)
    className?: string;
}

export default function MoonPhase({ progress, className = '' }: MoonPhaseProps) {
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // progress affects the intensity and size of the atmospheric halo
    const radiance = 0.5 + (clampedProgress * 0.5);

    return (
        <div className={`relative ${className}`}>
            {/* 1. Primary Atmospheric Halo (Deep Blue/Cyan) */}
            <motion.div
                className="absolute inset-[-40%] rounded-full blur-[40px] mix-blend-screen"
                animate={{
                    opacity: [0.2 + clampedProgress * 0.3, 0.4 + clampedProgress * 0.4, 0.2 + clampedProgress * 0.3],
                    scale: [1, 1.05, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background: `radial-gradient(circle, rgba(0, 191, 255, 0.4), rgba(0, 50, 100, 0.2), transparent 70%)`
                }}
            />

            {/* 2. Secondary Inner Glow (Bright Cyan) */}
            <motion.div
                className="absolute inset-[-10%] rounded-full blur-xl mix-blend-screen"
                animate={{
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background: `radial-gradient(circle, rgba(135, 206, 250, ${0.3 + clampedProgress * 0.4}), transparent 80%)`
                }}
            />

            {/* 3. The Moon Itself */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full relative z-10 overflow-visible"
            >
                <defs>
                    {/* Celestial Gradient */}
                    <radialGradient id="celestialMoonGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="40%" stopColor="#F0F8FF" />
                        <stop offset="100%" stopColor="#B0C4DE" />
                    </radialGradient>

                    {/* Moon Surface Distortion */}
                    <filter id="surfaceNoise" x="0" y="0" width="100" height="100">
                        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                        <feDiffuseLighting in="noise" lightingColor="#F0F8FF" surfaceScale="2" result="diffuse">
                            <feDistantLight azimuth="45" elevation="10" />
                        </feDiffuseLighting>
                        <feComposite in="diffuse" in2="SourceGraphic" operator="in" />
                    </filter>

                    {/* Atmospheric Cloud Filter */}
                    <filter id="atmosphericClouds" x="-50%" y="-50%" width="200%" height="200%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" seed="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
                        <feGaussianBlur stdDeviation="10" />
                    </filter>
                </defs>

                {/* Moon Base */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="url(#celestialMoonGradient)"
                    animate={{
                        filter: [`brightness(1) contrast(1)`, `brightness(${1.1 + clampedProgress * 0.2}) contrast(1.1)`, `brightness(1) contrast(1)`]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' }}
                />

                {/* Realistic Craters & Textures */}
                <g opacity={0.4 + (clampedProgress * 0.3)} className="mix-blend-multiply">
                    <circle cx="35" cy="40" r="12" fill="rgba(70, 130, 180, 0.2)" filter="blur(4px)" />
                    <circle cx="65" cy="55" r="8" fill="rgba(70, 130, 180, 0.2)" filter="blur(3px)" />
                    <circle cx="50" cy="70" r="15" fill="rgba(70, 130, 180, 0.15)" filter="blur(5px)" />
                    <path d="M40 25 Q50 35 60 25" stroke="rgba(70, 130, 180, 0.1)" strokeWidth="2" fill="none" filter="blur(2px)" />
                </g>

                {/* Internal Luminescence (Tiny Stars/Energy) */}
                {clampedProgress > 0.5 && (
                    <motion.g
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <circle cx="45" cy="45" r="0.5" fill="white" />
                        <circle cx="55" cy="35" r="0.8" fill="white" />
                        <circle cx="40" cy="60" r="0.6" fill="white" />
                    </motion.g>
                )}
            </svg>

            {/* 4. Atmospheric Clouds Framing (The "Fluffy" look) */}
            <div className="absolute inset-[-100%] pointer-events-none opacity-40 mix-blend-overlay overflow-visible">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <motion.circle
                        cx="100" cy="100" r="90"
                        fill="rgba(0, 191, 255, 0.1)"
                        filter="url(#atmosphericClouds)"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>

            {/* Phase label - Stealthy but Elegant */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mb-1" />
                <span className="text-[10px] font-display font-black tracking-[0.5em] text-cyan-200/40 uppercase italic whitespace-nowrap">
                    {clampedProgress < 1 ? 'Resonating_Soul_Light' : 'Complete_Unity'}
                </span>
            </div>
        </div>
    );
}
