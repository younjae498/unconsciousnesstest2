'use client';

import React from 'react';
import { motion } from 'framer-motion';
import StoryText from '@/components/StoryText';

interface NarrativeIntervalProps {
    onContinue: () => void;
    progress: number; // 1, 2, 3... which interval is this?
}

export default function NarrativeInterval({ onContinue, progress }: NarrativeIntervalProps) {
    const narrativeSteps = [
        "당신의 진심이 닿을 때마다 <br/> 신수의 깊은 흉터가 안개처럼 흩어집니다.",
        "숲의 그림자들이 위협하지만, <br/> 당신은 그의 손을 잡고 꿋꿋이 나아갑니다."
    ];

    const currentText = narrativeSteps[(progress - 1) % narrativeSteps.length];

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.5 }}
                className="max-w-2xl space-y-12"
            >
                <header className="flex flex-col items-center gap-2 mb-8">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center"
                    >
                        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]" />
                    </motion.div>
                    <span className="text-[var(--fluid-caption)] font-display font-black tracking-[0.8em] text-white/40 uppercase italic">Narrative_Echo</span>
                </header>

                <StoryText
                    text={currentText}
                    speed={0.06}
                    className="text-3xl sm:text-4xl font-display font-medium leading-relaxed text-white italic tracking-tight"
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 2 }}
                    className="pt-8"
                >
                    <p className="text-xl text-stone-500 italic mb-12">
                        "수호신의 몸에 조금씩 색이 차오르기 시작합니다."
                    </p>

                    <button
                        onClick={onContinue}
                        className="group flex flex-col items-center gap-4 mx-auto"
                    >
                        <div className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-full group-hover:border-white transition-all">
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-white rotate-45 border-t border-r border-white"
                            />
                        </div>
                        <span className="text-[var(--fluid-caption)] tracking-[0.5em] text-white/40 group-hover:text-white transition-all uppercase italic">계속해서 나아가기</span>
                    </button>
                </motion.div>
            </motion.div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-white/20"
                />
            </div>
        </div>
    );
}
