'use client';
import React from 'react';
import { motion, useTransform } from 'framer-motion';
interface TestBookFrameProps {
    children: React.ReactNode;
    title?: string;
    stage?: string;
    mouseX: any;
    mouseY: any;
    isWalking?: boolean;
    walkingDirection?: 'left' | 'right' | 'center';
    walkingProgress?: number; // 0-100, increases walking depth
    visualStage?: number; // 1-7 narrative progression
    backgroundImage?: string; // Dynamic background for narrative stages
}
export default function TestBookFrame({ children, stage, mouseX, mouseY, isWalking, walkingDirection = 'center', walkingProgress = 0, visualStage = 1, backgroundImage = '/forest_main_bg.jpg' }: TestBookFrameProps) {
    // Advanced Motion Mapping - Bypassing re-renders for absolute stability
    // These create MotionValues that update the DOM directly without React re-renders.
    const panningX = 0; // Disabled horizontal shift
    const tiltX = useTransform(mouseY, [0, 1], [3, -3]); // Vertical tilt kept for depth
    const tiltY = 0; // Disabled horizontal tilt
    // Dynamic Visual Filtering based on 7-step Narrative Progression
    // Preserving original colors as requested by the user.
    // 1-2: Subtle, 3-4: Soft, 5-6: Warm/Balanced, 7: Vivid/Glowing
    const visualFilter = visualStage <= 2
        ? 'saturate(0.6) brightness(1.0) contrast(1.05)'
        : visualStage <= 4
            ? 'saturate(0.9) brightness(1.05) contrast(1.02)'
            : visualStage <= 6
                ? 'saturate(1.2) brightness(1.1) contrast(1.0)'
                : 'saturate(1.5) brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.1))';
    return (
        <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-black">
            {/* Cinematic Background Layer - Truly Immersive & Full Screen */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 z-0 pointer-events-none"
            >
                {/* Main Forest Background Container (Consolidated) */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black"
                    animate={{
                        y: isWalking ? [0, -12, 0] : 0,
                        // Directional Sway: Intense lean and sway for tactile choice feedback
                        x: isWalking
                            ? (walkingDirection === 'left' ? [0, -25, 0] : walkingDirection === 'right' ? [0, 25, 0] : [0, 5, 0])
                            : 0,
                        rotateZ: isWalking
                            ? (walkingDirection === 'left' ? [0, -1.5, 0] : walkingDirection === 'right' ? [0, 1.5, 0] : [0, 0.3, 0])
                            : 0,
                        rotateX: isWalking ? [0, 0.8, 0] : 0,
                        scale: isWalking ? [1, 1.005, 1] : 1,
                    }}
                    transition={{
                        duration: 0.8, // Shorter duration for punchy single step
                        ease: "easeOut",
                    }}
                    style={{ willChange: 'transform' }}
                >
                    {/* Layer 1: Blurred "Ambiance" Base (Fills Screen) */}
                    {backgroundImage && (
                        <div
                            className="absolute inset-[-10%] bg-cover bg-center brightness-50 opacity-40 blur-3xl"
                            style={{ backgroundImage: `url("${backgroundImage}")` }}
                        />
                    )}
                    {/* Layer 2: Pristine "Whole Picture" Foreground (Full Screen Cover) */}
                    {backgroundImage && (
                        <motion.div
                            className="relative w-full h-full bg-cover bg-no-repeat bg-center z-10"
                            style={{
                                backgroundImage: `url("${backgroundImage}")`,
                                filter: isWalking ? `brightness(1.05) contrast(1.02) blur(0.5px) ${visualFilter}` : visualFilter,
                                // Combine cumulative progress zoom with a temporary 'surge' on each step
                                scale: (1 + (walkingProgress / 400)) * (isWalking ? 1.05 : 1),
                                translateZ: (walkingProgress * 0.5) + (isWalking ? 30 : 0),
                            }}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                scale: (1 + (walkingProgress / 400)) * (isWalking ? 1.05 : 1),
                                translateZ: (walkingProgress * 0.5) + (isWalking ? 30 : 0)
                            }}
                            transition={{
                                scale: { duration: 0.8, ease: "easeOut" },
                                translateZ: { duration: 0.8, ease: "easeOut" },
                                default: { duration: 1.5 }
                            }}
                        />
                    )}
                </motion.div>
            </motion.div>
            {/* Cinematic Content Frame (UI and Particles) - Direct Motion Mapping for Stability */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: isWalking ? [0, 4, -1, 4, 0] : 0, // Subtle counter-bob for UI stability
                    x: isWalking ? [0, -2, 0, 2, 0] : 0,
                }}
                transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    opacity: { duration: 1.5 },
                    scale: { duration: 1.5 }
                }}
                className="w-full h-full max-w-[1440px] flex flex-col relative z-20 pointer-events-none"
                style={{
                    rotateX: tiltX,
                    rotateY: tiltY,
                    margin: 'auto',
                    perspective: '2000px',
                    willChange: 'transform'
                }}
            >
                {/* Ambient Cinematic Vignette Layer with Heartbeat Pulse */}
                <motion.div
                    className="absolute inset-[-50%] z-0 pointer-events-none"
                    animate={{
                        opacity: [0.9, 0.98, 0.9, 1.0, 0.9], // Double-beat rhythm
                        scale: [1, 1.02, 1, 1.05, 1]
                    }}
                    transition={{
                        duration: 1.2, // ~50-60 bpm feel
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.4, 0.6, 1]
                    }}
                    style={{
                        background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)'
                    }}
                />
                {/* Stage Children Content - justify-start to prevent top clipping when content overflows */}
                <div className="w-full h-full flex flex-col items-center justify-start relative z-10 pointer-events-auto">
                    {children}
                </div>
                {/* Particle System: Dynamic Atmosphere based on Narrative Stage */}
                <div className="absolute inset-0 pointer-events-none z-[40]">
                    {[...Array(visualStage <= 2 ? 60 : 40)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute rounded-full blur-[1px] ${visualStage <= 2 ? 'w-1.5 h-1.5 bg-white/20' : 'w-1 h-1 bg-blue-100/30 blur-[2px]'}`}
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={visualStage <= 2 ? {
                                // Ash Fall Animation: Falling slowly with slight horizontal drift
                                y: ['-10%', '110%'],
                                x: [0, (i % 2 === 0 ? 30 : -30), 0],
                                rotate: [0, 360],
                                opacity: [0, 0.4, 0.4, 0]
                            } : {
                                // Light Seed Animation: Floating upwards/randomly
                                y: [0, -40, 0],
                                x: [0, (i % 3 === 0 ? 15 : -15), 0],
                                scale: [1, 1.4, 1],
                                opacity: [0.1, 0.4, 0.1]
                            }}
                            transition={{
                                duration: visualStage <= 2 ? (8 + Math.random() * 7) : (5 + Math.random() * 5),
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 10
                            }}
                        />
                    ))}
                </div>
                {/* Subliminal Walking Instruction */}
                {stage === 'INTRO' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isWalking ? 0 : 0.5 }}
                        className="absolute bottom-16 inset-x-0 text-center pointer-events-none z-[60]"
                    >
                        <span className="text-[0.7rem] font-display tracking-[0.8em] text-white/60 uppercase italic">
                            [ Venture Forth Into The Unknown ]
                        </span>
                    </motion.div>
                )}
            </motion.div>
            {/* Cinematic Perspective Overlays */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40 opacity-60" />
            <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] noise-bg" />
        </div>
    );
}
