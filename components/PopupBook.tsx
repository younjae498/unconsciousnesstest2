'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupBookProps {
    logoSrc: string;
    isFadingOut: boolean;
}

export default function PopupBook({ logoSrc, isFadingOut }: PopupBookProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`relative flex items-center justify-center min-h-screen bg-[#070708] overflow-hidden perspective-[3000px] transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>

            {/* Ambient Lighting / Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full opacity-50"></div>

            {/* Main Stage */}
            <motion.div
                className="relative w-[340px] h-[460px] sm:w-[540px] sm:h-[640px]"
                initial={{ rotateX: 60, scale: 0.6, y: 200, opacity: 0 }}
                animate={{ rotateX: 25, scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* BOTTOM BASE PAGE (The Floor) */}
                <div className="absolute inset-0 bg-[#fdfaf1] rounded-sm book-page overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/creampaper.png')]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>

                    {/* Floor Decorations (Printed text look) */}
                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end opacity-20">
                        <div className="space-y-2">
                            <div className="w-24 h-1 bg-black/60"></div>
                            <div className="w-32 h-1 bg-black/60"></div>
                        </div>
                        <div className="font-serif italic text-sm text-black/60 tracking-tighter">Chapter I: The Unconscious Mind</div>
                    </div>
                </div>

                {/* --- 3D DIORAMA LAYERS --- */}

                {/* 1. BACKGROUND SCENERY (The distant wall) */}
                <motion.div
                    className="absolute inset-x-0 bottom-1/2 h-full bg-[#fdfaf1] origin-bottom book-page overflow-hidden border-t-2 border-black/5"
                    initial={{ rotateX: -90 }}
                    animate={{ rotateX: isOpen ? 0 : -90 }}
                    transition={{ delay: 0.4, duration: 1.5, ease: [0.34, 1.3, 0.64, 1] }}
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                    <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/creampaper.png')]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                    {/* Background Graphics (Abstract cut-outs) */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-4 opacity-5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-12 h-64 bg-black rounded-t-full"></div>
                        ))}
                    </div>
                </motion.div>

                {/* 2. MIDDLE LAYER: THE MAIN V-FOLD BRIDGE */}
                <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-full h-[300px] z-20" style={{ transformStyle: 'preserve-3d' }}>

                    {/* Left Wing Support */}
                    <motion.div
                        className="absolute bottom-0 right-1/2 w-24 h-48 bg-[#fdfaf1] origin-bottom-right border-l border-black/5"
                        initial={{ rotateY: 90, rotateX: 0 }}
                        animate={{ rotateY: isOpen ? 45 : 90, rotateX: isOpen ? -15 : 0 }}
                        transition={{ delay: 0.7, duration: 1.2 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    ></motion.div>

                    {/* Right Wing Support */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 w-24 h-48 bg-[#fdfaf1] origin-bottom-left border-r border-black/5"
                        initial={{ rotateY: -90, rotateX: 0 }}
                        animate={{ rotateY: isOpen ? -45 : -90, rotateX: isOpen ? -15 : 0 }}
                        transition={{ delay: 0.7, duration: 1.2 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    ></motion.div>

                    {/* THE MAIN LOGO (Tipped-in look) */}
                    <motion.div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
                        initial={{ rotateX: -90, y: 100, opacity: 0 }}
                        animate={{ rotateX: isOpen ? -10 : -90, y: isOpen ? 0 : 100, opacity: isOpen ? 1 : 0 }}
                        transition={{ delay: 0.9, duration: 1.4, ease: [0.175, 0.885, 0.32, 1.275] }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div className="relative">
                            {/* Logo Glow */}
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-110"></div>

                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="w-48 sm:w-64 h-auto object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                            />

                            {/* Paper Base Support */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-40 h-10 bg-[#fdfaf1] border border-black/5 -z-10 skew-x-12"></div>
                        </div>
                    </motion.div>
                </div>

                {/* 3. FOREGROUND LAYER: THE POPUP GRASS/ELEMENTS */}
                <motion.div
                    className="absolute bottom-10 left-10 right-10 h-20 z-40"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: isOpen ? 0 : -90, opacity: isOpen ? 1 : 0 }}
                    transition={{ delay: 1.1, duration: 1 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="flex justify-between items-end h-full">
                        <div className="w-16 h-12 bg-[#fdfaf1] border border-black/5 rounded-t-lg shadow-sm origin-bottom rotate-[-10deg]"></div>
                        <div className="w-24 h-16 bg-[#fdfaf1] border border-black/5 rounded-t-lg shadow-sm origin-bottom rotate-[5deg]"></div>
                        <div className="w-12 h-10 bg-[#fdfaf1] border border-black/5 rounded-t-lg shadow-sm origin-bottom rotate-[-5deg]"></div>
                    </div>
                </motion.div>

                {/* --- FRONT COVER (THE MASTER FLIP) --- */}
                <motion.div
                    className="absolute inset-x-0 bottom-1/2 h-full z-[60] origin-bottom shadow-2xl"
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: isOpen ? -165 : 0 }}
                    transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                    {/* Front Cover Exterior */}
                    <div className="absolute inset-0 bg-[#16161a] rounded-t-sm border-t border-white/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <motion.div
                                className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-6"
                                animate={{ opacity: isOpen ? 0 : 1 }}
                            >
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse"></div>
                            </motion.div>
                            <motion.h1
                                className="text-white/40 font-serif tracking-[0.4em] text-xs font-light"
                                animate={{ opacity: isOpen ? 0 : 1 }}
                            >
                                UNCONSCIOUS MAP
                            </motion.h1>
                        </div>
                    </div>

                    {/* Front Cover Interior (Visible after flipping) */}
                    <div
                        className="absolute inset-0 bg-[#fdfaf1] book-page"
                        style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
                    >
                        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/creampaper.png')]"></div>
                        <div className="p-12 font-serif text-black/10">
                            <div className="w-full h-[1px] bg-black/5 mb-8"></div>
                            <div className="space-y-3">
                                <div className="w-full h-1 bg-black/5"></div>
                                <div className="w-5/6 h-1 bg-black/5"></div>
                                <div className="w-full h-1 bg-black/5"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* Stage Lighting / Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-white/5 blur-[80px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-blue-500/5 blur-[60px] rounded-full animate-pulse delay-1000"></div>
            </div>

            <style jsx global>{`
                .book-page {
                    box-shadow: inset 0 0 100px rgba(0,0,0,0.03), 0 10px 40px rgba(0,0,0,0.15);
                    border: 1px solid rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
}
