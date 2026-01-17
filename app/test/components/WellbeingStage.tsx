'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTestStore } from '@/store/testStore';
import LikertScale from './LikertScale';
import MoonPhase from './MoonPhase';
import StoryText from '@/components/StoryText';
import { StageRef } from '../types';
import { TestData } from '@/app/data/testData';

const questions = TestData.wellbeingQuestions;

const BloomingFlowers = ({ currentIndex, total }: { currentIndex: number, total: number }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {Array.from({ length: total }).map((_, i) => {
                const isBloomed = i <= currentIndex;
                const x = ((i * 137) % 90) + 5;
                const y = ((i * 261) % 70) + 15;
                const seed = i;
                const isRose = i % 3 === 0;

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: isBloomed ? 0.4 : 0.03,
                            scale: isBloomed ? 1.2 : 0.7,
                        }}
                        transition={{ duration: 1.5, delay: isBloomed ? 0.2 : 0 }}
                        className="absolute"
                        style={{ left: `${x}%`, top: `${y}%` }}
                    >
                        <svg width="120" height="130" viewBox="0 0 100 110" className="overflow-visible">
                            <defs>
                                {/* Shared Sketchbook Palette */}
                                <linearGradient id={`bg-sketch-petal-${i}`} x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2A2A2A" />
                                    <stop offset="100%" stopColor="#606060" />
                                </linearGradient>

                                <linearGradient id={`bg-sketch-rose-${i}`} x1="0%" y1="100%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4A252A" />
                                    <stop offset="100%" stopColor="#9B4F5E" />
                                </linearGradient>

                                <radialGradient id={`bg-sketch-core-${i}`}>
                                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                                </radialGradient>

                                <pattern id={`bg-hatching-${i}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                                    <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(0,0,0,0.2)" strokeWidth="0.4" />
                                </pattern>
                            </defs>

                            <motion.g
                                animate={isBloomed ? { rotate: [0, 2, -2, 0], y: [0, -3, 0] } : {}}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                style={{ originX: '50px', originY: '85px' }}
                            >
                                {/* Hand-drawn stem */}
                                <path d="M50 100 Q52 90 50 85" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />

                                {/* Illustrative Petal Layers */}
                                {[
                                    { d: "M50 85 C20 75 5 45 10 25 C15 5 35 5 50 85", r: -40 },
                                    { d: "M50 85 C80 75 95 45 90 25 C85 5 65 5 50 85", r: 40 },
                                    { d: "M50 85 C35 70 25 50 30 30 C35 15 45 15 50 85", r: -15 },
                                    { d: "M50 85 C65 70 75 50 70 30 C65 15 55 15 50 85", r: 15 }
                                ].map((p, idx) => (
                                    <motion.path
                                        key={idx} d={p.d}
                                        fill={isRose ? `url(#bg-sketch-rose-${i})` : `url(#bg-sketch-petal-${i})`}
                                        stroke="#111" strokeWidth="0.5"
                                        animate={isBloomed ? { rotate: p.r, opacity: 0.7 } : { rotate: p.r * 0.1, opacity: 0.3 }}
                                        transition={{ duration: 2.5 }}
                                        style={{ originX: '50px', originY: '85px' }}
                                    />
                                ))}

                                {/* Golden Core Bloom */}
                                {isBloomed && (
                                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                                        <circle cx="50" cy="58" r="8" fill={`url(#bg-sketch-core-${i})`} className="mix-blend-multiply" />
                                        <path d="M50 85 C42 70 38 40 50 5 C62 40 58 70 50 85" fill="#444" stroke="#000" strokeWidth="0.8" opacity="0.6" />
                                        <path d="M50 85 C42 70 38 40 50 5 C62 40 58 70 50 85" fill={`url(#bg-hatching-${i})`} opacity="0.3" />
                                    </motion.g>
                                )}
                            </motion.g>
                        </svg>
                    </motion.div>
                );
            })}
        </div>
    );
};

const WellbeingStage = forwardRef<StageRef, WellbeingStageProps>(({ onComplete, setIsWalking }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (currentIndex > 0) {
                setCurrentIndex(p => p - 1);
                setAnswers(prev => prev.slice(0, -1));
                return true;
            }
            return false;
        }
    }));

    useEffect(() => {
        useTestStore.getState().setVisualStage(6);
    }, []);

    const handleAnswer = (value: number) => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        const newAnswers = [...answers, value];
        setAnswers(newAnswers);
        useTestStore.getState().incrementWalkingProgress();

        const direction = value <= 2 ? 'left' : value >= 4 ? 'right' : 'center';
        setIsWalking?.(true, direction);
        setTimeout(() => setIsWalking?.(false, direction), 600);

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsTransitioning(false);
            } else {
                useTestStore.getState().setVisualStage(7);
                onComplete(newAnswers);
            }
        }, 800);
    };

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center font-body overflow-hidden px-4 pt-4 pb-4 bg-black/20">
            {/* Background Blooming Effect */}
            <BloomingFlowers currentIndex={currentIndex - 1 + (isTransitioning ? 1 : 0)} total={questions.length} />

            {/* Header Whisper */}
            <header className="text-center mb-4 relative z-10 shrink-0 flex flex-col items-center justify-center gap-2 overflow-visible">
                <MoonPhase
                    progress={(currentIndex + (isTransitioning ? 1 : 0)) / questions.length}
                    className="w-16 h-16 sm:w-24 sm:h-24"
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="flex flex-col items-center gap-1"
                >
                    <span className="text-[10px] font-display font-black tracking-[0.8em] text-white uppercase italic text-center">Chapter IV. 영혼의 반추: [달이 차오르는 밤의 문답]</span>
                </motion.div>
            </header>

            {/* Narrative Prime */}
            <div className="text-center mb-6 space-y-4 relative z-10 px-8 shrink-0">
                <StoryText
                    text="&quot;어느덧 숲은 두 사람만의 찬란한 화실(畵室)이 됩니다. 신수가 비로소 눈을 뜨기 직전, 당신의 손을 잡고 아주 낮은 목소리로 묻습니다. “아이야, 나를 구원하는 동안 정작 너의 영혼은 안녕했느냐?”&quot;"
                    speed={0.04}
                    className="text-lg sm:text-xl text-stone-200 italic font-body tracking-[0.05em] leading-relaxed max-w-2xl mx-auto drop-shadow-lg"
                />

                {/* Interaction Guide */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="bg-white/5 backdrop-blur-xl rounded-full px-6 py-2 border border-white/10 max-w-xl mx-auto"
                >
                    <p className="text-[11px] text-stone-400 font-body tracking-wider">
                        <span className="text-white/60 mr-2 uppercase italic font-black text-[9px] tracking-[0.2em]">여정의 규칙:</span>
                        지난 한 주간 당신의 삶을 되돌아보며, 각 질문에 대해 가장 마음이 가는 단계를 선택해 <span className="text-white italic">밤하늘의 달</span>을 채워 주세요.
                    </p>
                </motion.div>
            </div>

            <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 overflow-visible min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-4xl space-y-8 text-center overflow-visible"
                    >
                        <div className="space-y-4">
                            <StoryText
                                key={currentIndex}
                                text={questions[currentIndex]?.replace(/\*\*(.*?)\*\*/g, '$1') || ''}
                                speed={0.05}
                                className="text-2xl sm:text-3xl font-display font-medium leading-tight text-white italic tracking-tight px-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            />
                        </div>

                        <div className="w-full px-4 overflow-visible flex flex-col items-center gap-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                className="text-[9px] font-black tracking-[0.4em] text-white/40 uppercase italic"
                            >
                                [피어나는 야화 (Night-blooming Flowers)]
                            </motion.div>
                            <LikertScale
                                value={answers[currentIndex] || 0}
                                onChange={handleAnswer}
                                min={1}
                                max={4}
                                leftLabel="그렇지 않다"
                                rightLabel="매우 그렇다"
                                variant="night-bloom"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Immersive Tracker */}
            <div className="mt-auto flex flex-col items-center gap-[4vh] relative z-30 pb-[6vh] shrink-0">
                <div className="flex justify-center gap-8">
                    {questions.map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-1 h-1 rounded-full transition-all duration-1000 ${i <= currentIndex ? 'bg-white' : 'bg-white/20'}`}
                            animate={i === currentIndex ? {
                                scale: 2,
                                boxShadow: ['0 0 0px white', '0 0 15px white', '0 0 0px white']
                            } : {
                                scale: 1,
                                boxShadow: 'none'
                            }}
                            transition={{ duration: 2, repeat: i === currentIndex ? Infinity : 0 }}
                        />
                    ))}
                </div>
                <div className="text-[var(--fluid-caption)] font-display font-black tracking-[0.8em] text-stone-600 uppercase italic opacity-60">
                    Gazing_Into_Deep_Mirror
                </div>
            </div>
        </div>
    );
});

WellbeingStage.displayName = 'WellbeingStage';

export default WellbeingStage;
