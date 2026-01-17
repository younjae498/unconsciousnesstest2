'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTestStore } from '@/store/testStore';
import { TestData } from '../../data/testData';
import { motion, AnimatePresence } from 'framer-motion';
import LikertScale from './LikertScale';
import StoryText from '@/components/StoryText';
import NarrativeInterval from './NarrativeInterval';
import { StageRef } from '../types';

type CompassionType = 'sun' | 'water' | 'breath';

interface ExplicitStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (data: any) => void;
    setIsWalking?: (walking: boolean, direction?: 'left' | 'right' | 'center') => void;
}

// Shared Background Component with Heartbeat Effect
const HeartbeatBackground = ({ isPulsing }: { isPulsing: boolean }) => (
    <AnimatePresence mode="wait">
        <motion.div
            key="stage-bg-heartbeat"
            initial={{ opacity: 0 }}
            animate={isPulsing ? {
                scale: [1, 1.1, 1],
                opacity: 1
            } : {
                opacity: 1,
                scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={isPulsing ? {
                duration: 0.8,
                ease: "easeInOut"
            } : {
                duration: 1
            }}
            className="absolute inset-0 z-0 pointer-events-none"
        >
            <img
                src="/74.jpeg"
                alt="Background Heartbeat"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </motion.div>
    </AnimatePresence>
);

const ExplicitStage = forwardRef<StageRef, ExplicitStageProps>(({ onComplete, setIsWalking }, ref) => {
    const [phase, setPhase] = useState<'PRIMING' | 'SURVEY'>('PRIMING');
    const [goalText, setGoalText] = useState('');
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showInterval, setShowInterval] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        // Set visual stage for Chapter III
        useTestStore.getState().setVisualStage(5);
    }, []);

    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (showInterval) {
                setShowInterval(false);
                return true;
            }
            if (phase === 'SURVEY') {
                if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(p => p - 1);
                    return true;
                }
                setPhase('PRIMING');
                return true;
            }
            return false;
        }
    }));

    const questions = TestData.explicitQuestions;
    const setStoreExplicitAnswer = useTestStore(state => state.setExplicitAnswer);

    const handleStartSurvey = () => {
        if (goalText.trim().length > 0) {
            useTestStore.getState().setExplicitGoal(goalText);
            setPhase('SURVEY');
        }
    };

    const handleAnswer = (val: number) => {
        const newAnswers = { ...answers, [currentQuestionIndex]: val };
        setAnswers(newAnswers);
        setStoreExplicitAnswer(String(currentQuestionIndex), val);
        useTestStore.getState().incrementWalkingProgress();
        const direction = val <= 2 ? 'left' : val >= 4 ? 'right' : 'center';
        setIsWalking?.(true, direction);
        setIsPulsing(true);
        setTimeout(() => {
            setIsWalking?.(false, direction);
            setIsPulsing(false);
        }, 800);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex > 0 && nextIndex % 5 === 0 && nextIndex < questions.length) {
            setShowInterval(true);
        } else {
            proceed(nextIndex, newAnswers);
        }
    };

    const proceed = (nextIndex: number, currentAnswers: Record<number, number>) => {
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            useTestStore.getState().setVisualStage(6); // Move to Chapter IV
            onComplete({ goal: goalText, answers: currentAnswers });
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center font-body text-stone-200">
            <HeartbeatBackground isPulsing={isPulsing} />

            {phase === 'PRIMING' ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-20 px-[5vw] py-[5vh]">
                    <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-[8vh]">

                        <div className="space-y-[4vh]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic">Chapter III. 의식의 공명: [길을 잃지 않는 약속]</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="space-y-[6vh]"
                            >
                                <StoryText
                                    text="&quot;당신의 진심이 담긴 가치관의 원석들이 그의 심장에 깊이 스며들 때마다, 메마르고 창백했던 신수의 몸 위로 온기가 흐르기 시작합니다. 그 온기가 지나간 자리마다 당신과 맺은 약속들이 눈부신 자수 문양이 되어, 마치 갓 피어난 꽃잎처럼 신수의 살결 위를 부드럽게 감싸 안습니다. <br/><br/> <span class='text-white/90 font-black'>&quot;괜찮아, 이제 더는 외로워하지 마. 아무도 너를 버리지 않게 내가 끝까지 네 곁을 지킬게.&quot;</span>&quot;"
                                    speed={0.03}
                                    className="text-[var(--fluid-h2)] font-display font-black italic text-white/80 leading-relaxed tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                />
                            </motion.div>
                        </div>

                        <div className="w-full max-w-xl flex flex-col items-center gap-12 pt-[4vh] relative">
                            {/* Golden Resonance Message */}
                            <StoryText
                                text="&quot;그것은 단순한 계획이 아니라, 다시 한번 앞을 향해 나아가겠다는 당신의 고결한 생명력이었습니다. 당신의 의지가 신수의 심장에 닿는 순간, 거대한 흉벽을 가득 채웠던 자수 문양들이 일제히 황금빛으로 공명하며 찬란한 파동을 일으킵니다.&quot;"
                                speed={0.03}
                                className="text-lg sm:text-x text-white/70 italic font-body tracking-wider text-center"
                            />

                            <div className="w-full space-y-6 relative">


                                <p
                                    className="text-stone-300 font-body text-lg italic text-center relative z-10 drop-shadow-md"
                                >
                                    &quot;2026년에 당신이 달성하고 싶은 가장 중요한 목표 1~2가지를 잠시 생각해 보세요. <br /> (예: 승진, 새로운 기술 습득, 좋은 관계 맺기 등)&quot;
                                </p>
                                <div className="relative group z-10">
                                    <textarea
                                        value={goalText}
                                        onChange={(e) => setGoalText(e.target.value)}
                                        placeholder="상세 하게 적어주 실 수록 도움이 되는 리포트를 제공 할 수 있습니다"
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-body text-xl focus:outline-none focus:border-white/30 transition-all placeholder:text-stone-600 resize-none"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {goalText.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={handleStartSurvey}
                                        className="mt-4 group cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                                            />
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white] z-10" />
                                            <div className="absolute w-8 h-8 border border-white/10 rounded-full group-hover:border-white/40 group-hover:scale-125 transition-all duration-1000" />
                                        </div>
                                        <span className="mt-4 text-[9px] font-display font-black tracking-[0.6em] text-white/30 group-hover:text-white transition-all uppercase italic">DEEP_COORDINATION</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10 px-4 py-6">

                    <header className="text-center mb-6 relative z-10 shrink-0 h-10 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-[var(--fluid-caption)] font-display font-black tracking-[1em] text-white uppercase italic">Echo_From_The_Prism</span>
                            <span className="text-[10px] text-stone-500 mt-1 uppercase tracking-[0.2em]">제시된 가치관 원석에 대한 의식적 응답 진행</span>
                        </motion.div>
                        <div className="mt-2 text-center">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[var(--fluid-h3)] font-display font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_white] max-w-xl truncate px-10"
                            >
                                &quot;{goalText}&quot;
                            </motion.span>
                        </div>
                    </header>

                    <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="w-full max-w-3xl space-y-8 text-center relative"
                            >
                                {/* Golden Cracks Heartbeat Effect - Continued Magnesium Veins (Survey) */}
                                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center mix-blend-screen overflow-visible">
                                    <svg viewBox="0 0 800 600" className="w-[180%] h-[180%] opacity-100 overflow-visible" preserveAspectRatio="xMidYMid slice">
                                        <defs>
                                            <filter id="expert-vein-glow-survey" x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur stdDeviation="4" result="blur-large" />
                                                <feFlood floodColor="#FF4500" result="color-deep" />
                                                <feComposite in="color-deep" in2="blur-large" operator="in" result="glow-deep" />

                                                <feGaussianBlur stdDeviation="1.5" in="SourceGraphic" result="blur-small" />
                                                <feFlood floodColor="#FFD700" result="color-bright" />
                                                <feComposite in="color-bright" in2="blur-small" operator="in" result="glow-bright" />

                                                <feGaussianBlur stdDeviation="0.5" in="SourceGraphic" result="blur-tiny" />
                                                <feFlood floodColor="#FFFFFF" result="color-core" />
                                                <feComposite in="color-core" in2="blur-tiny" operator="in" result="glow-core" />

                                                <feMerge>
                                                    <feMergeNode in="glow-deep" />
                                                    <feMergeNode in="glow-bright" />
                                                    <feMergeNode in="glow-core" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <motion.g
                                            animate={{
                                                opacity: [0.3, 0.6, 0.3]
                                            }}
                                            transition={{
                                                duration: 6,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            stroke="url(#vein-pro-gradient)"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                            filter="url(#expert-vein-glow-survey)"
                                        >
                                            {/* PRO DESIGN: Survey Phase (More expansive) */}
                                            <path d="M400 300 Q450 200 500 150 T600 100" strokeWidth="2.5" />
                                            <path d="M500 150 Q550 120 600 110" strokeWidth="1.5" />
                                            <path d="M400 300 Q350 250 300 200 T200 150" strokeWidth="2.5" />
                                            <path d="M300 200 Q250 180 200 140" strokeWidth="1.5" />
                                            <path d="M400 300 Q420 380 440 460 T480 540" strokeWidth="2" />
                                            <path d="M400 300 Q360 360 320 420 T260 480" strokeWidth="2" />

                                            {/* Webbing/Mesh pattern for "Cracked" look */}
                                            <path d="M300 200 Q400 220 500 150" strokeWidth="1" opacity="0.6" />
                                            <path d="M320 420 Q400 400 440 460" strokeWidth="1" opacity="0.6" />

                                            {/* High Density Capillaries */}
                                            {[...Array(25)].map((_, i) => (
                                                <path
                                                    key={`s-${i}`}
                                                    d={`M${100 + Math.random() * 600} ${50 + Math.random() * 500} Q${150 + Math.random() * 500} ${100 + Math.random() * 500} ${200 + Math.random() * 400} ${150 + Math.random() * 400}`}
                                                    strokeWidth={0.5 + Math.random()}
                                                    opacity={0.5 + Math.random() * 0.5}
                                                />
                                            ))}

                                            {/* Intense Sparkles */}
                                            {[...Array(10)].map((_, i) => (
                                                <circle
                                                    key={`sn-${i}`}
                                                    cx={Math.random() * 800}
                                                    cy={Math.random() * 600}
                                                    r={Math.random() * 2.5}
                                                    fill="#FFF"
                                                >
                                                    <animate attributeName="r" values="0;3;0" dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
                                                </circle>
                                            ))}
                                        </motion.g>
                                    </svg>
                                </div>

                                {questions[currentQuestionIndex] ? (
                                    <div className="space-y-6">

                                        <StoryText
                                            key={currentQuestionIndex}
                                            text={questions[currentQuestionIndex].text.replace(/\*\*(.*?)\*\*/g, '$1')}
                                            speed={0.03}
                                            delay={questions[currentQuestionIndex].image ? 2.0 : 0}
                                            className="text-[var(--fluid-h2)] font-display font-medium leading-relaxed text-white italic tracking-tight px-12"
                                        />

                                        <motion.div
                                            className="w-full px-4 overflow-visible"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: questions[currentQuestionIndex].image ? 2.5 : 0 }}
                                        >
                                            <LikertScale
                                                value={answers[currentQuestionIndex] || 0}
                                                onChange={handleAnswer}
                                                min={1}
                                                max={5}
                                                leftLabel="전혀 아닙니다"
                                                rightLabel="매우 그렇습니다"
                                                variant="flame"
                                            />
                                        </motion.div>
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Ghostly Progress Markers - Echo Thread */}
                    <div className="flex justify-center gap-10 shrink-0 pb-16 mt-8 relative z-30">
                        {questions.map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1 h-1 rounded-full transition-all duration-1000 ${i <= currentQuestionIndex ? 'bg-white' : 'bg-white/20'}`}
                                animate={i === currentQuestionIndex ? {
                                    scale: 2,
                                    boxShadow: ['0 0 0px white', '0 0 10px white', '0 0 0px white']
                                } : {
                                    scale: 1,
                                    boxShadow: 'none'
                                }}
                                transition={{ duration: 2, repeat: i === currentQuestionIndex ? Infinity : 0 }}
                            />
                        ))}
                    </div>

                    <AnimatePresence>
                        {showInterval && (
                            <NarrativeInterval
                                progress={Math.floor((currentQuestionIndex + 1) / 5) + 3}
                                onContinue={() => {
                                    setShowInterval(false);
                                    proceed(currentQuestionIndex + 1, answers);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
});

export default ExplicitStage;
