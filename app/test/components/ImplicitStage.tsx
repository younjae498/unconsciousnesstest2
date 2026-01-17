'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTestStore } from '@/store/testStore';
import LanternScale from './LanternScale';
import StoryText from '@/components/StoryText';
import NarrativeInterval from './NarrativeInterval';
import { TestData } from '@/app/data/testData';
import { StageRef } from '../types';

// Questions (Implicit Probe)
const commonQuestions = [
    { id: 'q1', text: '나는 저 희미한 안개 너머에서 <br/>그의 잃어버린 감정을 보았는가?' },
    { id: 'q2', text: '나의 시선이 그에게 닿았을 때 <br/>그의 내면에서 색이 피어나는가?' },
    { id: 'q3', text: '지금 이 장면 속에서 <br/>나는 희망의 숨결을 느끼고 있나?' },
    { id: 'q4', text: '어두운 숲의 적막이 <br/>포근한 요람처럼 느껴지는가?' },
    { id: 'q5', text: '흩날리는 하얀 재 사이로 <br/>누군가의 다정한 속삭임이 들리는가?' },
    { id: 'q6', text: '굳게 닫힌 신수의 마음 문이 <br/>나의 온기에 조금씩 열리고 있는가?' },
];

interface ImplicitStageProps {
    onComplete: (data: Record<string, number>) => void;
    setIsWalking?: (walking: boolean, direction?: 'left' | 'right' | 'center') => void;
}

const ImplicitStage = forwardRef<StageRef, ImplicitStageProps>(({ onComplete, setIsWalking }, ref) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentQuestionInImageIndex, setCurrentQuestionInImageIndex] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState(0); // This will be updated by LanternScale
    const [timeLeft, setTimeLeft] = useState(15);
    const [showInterval, setShowInterval] = useState(false);
    const [narrativePage, setNarrativePage] = useState<0 | 1 | 2 | 3>(0); // 0: Encounter, 1: Connection, 2: Intro Narrative, 3: Test
    const [overallQuestionIndex, setOverallQuestionIndex] = useState(0); // For progress dot calculation
    const [isTransitioning, setIsTransitioning] = useState(false);

    const commonQuestions = TestData.implicitCommonQuestions;
    const images = TestData.implicitImages;

    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (isTransitioning) return false; // Block back during transition
            if (showInterval) {
                setShowInterval(false);
                // Stay on current question to re-answer
                setTotalAnswered(t => t > 0 ? t - 1 : 0);
                return true;
            }
            if (narrativePage === 3) {
                if (overallQuestionIndex > 0) {
                    const newOverall = overallQuestionIndex - 1;
                    const qLen = commonQuestions.length;
                    setOverallQuestionIndex(newOverall);
                    setCurrentImageIndex(Math.floor(newOverall / qLen));
                    setCurrentQuestionInImageIndex(newOverall % qLen);
                    setTotalAnswered(newOverall);
                    setTimeLeft(15);
                    setCurrentAnswer(0);
                    return true;
                }
                setNarrativePage(2);
                return true;
            }
            if (narrativePage > 0) {
                setNarrativePage(p => (p - 1) as 0 | 1 | 2 | 3);
                return true;
            }
            return false;
        }
    }));

    const currentImage = images[currentImageIndex];
    const currentQuestion = commonQuestions[currentQuestionInImageIndex] || commonQuestions[0]; // Fallback to prevent stuck state

    useEffect(() => {
        // Set visual stage for Chapter II
        useTestStore.getState().setVisualStage(4);
    }, []);

    useEffect(() => {
        if (narrativePage === 3 && timeLeft > 0 && !showInterval && !isTransitioning) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !showInterval && narrativePage === 3 && !isTransitioning) {
            handleTimeout();
        }
    }, [timeLeft, narrativePage, showInterval, isTransitioning]);

    const handleTimeout = () => {
        if (!currentImage || !currentQuestion || isTransitioning) return;
        setIsTransitioning(true);

        // Silent update (Neutral 3)
        const questionKey = `${currentImage.id}_${currentQuestion.id}`;
        const newAnswers = { ...answers, [questionKey]: 3 }; // 3 is neutral
        setAnswers(newAnswers);
        useTestStore.getState().setImplicitAnswer(questionKey, 3);
        // Do NOT set currentAnswer (visuals remain off)

        // Update counts
        const nextCount = totalAnswered + 1;
        setTotalAnswered(nextCount);

        // Proceed immediately
        if (nextCount > 0 && nextCount % commonQuestions.length === 0 && nextCount < (images.length * commonQuestions.length)) {
            setShowInterval(true);
            setIsTransitioning(false); // Reset immediately as we show interval
        } else {
            proceed();
            setIsTransitioning(false);
        }
    };

    const handleAnswer = (value: number) => {
        if (!currentImage || !currentQuestion || isTransitioning) return;
        setIsTransitioning(true);

        // 1. Visual Feedback Immediate
        setCurrentAnswer(value);

        // 2. Logic Update
        const questionKey = `${currentImage.id}_${currentQuestion.id}`;
        const newAnswers = { ...answers, [questionKey]: value };
        setAnswers(newAnswers);
        useTestStore.getState().setImplicitAnswer(questionKey, value);
        useTestStore.getState().incrementWalkingProgress();

        const direction = value <= 3 ? 'left' : value >= 5 ? 'right' : 'center';
        setIsWalking?.(true, direction);

        const nextCount = totalAnswered + 1;
        setTotalAnswered(nextCount);

        // 3. Delayed Progression
        setTimeout(() => {
            setIsWalking?.(false, direction);
            setCurrentAnswer(0); // Reset visual

            if (nextCount > 0 && nextCount % commonQuestions.length === 0 && nextCount < (images.length * commonQuestions.length)) {
                setShowInterval(true);
                setIsTransitioning(false);
            } else {
                proceed();
                setIsTransitioning(false);
            }
        }, 500);
    };

    const proceed = () => {
        if (currentQuestionInImageIndex < commonQuestions.length - 1) {
            setCurrentQuestionInImageIndex(prev => prev + 1);
            setOverallQuestionIndex(prev => prev + 1);
            setTimeLeft(15);
            setCurrentAnswer(0); // Reset current answer for the new question
        } else if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
            setCurrentQuestionInImageIndex(0);
            setOverallQuestionIndex(prev => prev + 1);
            setTimeLeft(15);
            setCurrentAnswer(0); // Reset current answer for the new image/question
        } else {
            useTestStore.getState().setVisualStage(5); // Move to Chapter III
            onComplete(answers);
        }
    };

    // Page 0: Encounter
    if (narrativePage === 0) {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden" onClick={() => setNarrativePage(1)}>

                {/* Full Screen Monster Background */}
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2.0 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/73.png"
                        alt="Monster Encounter"
                        className="w-full h-full object-cover opacity-50 contrast-125 saturate-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="relative z-10 space-y-12"
                >
                    <header className="mb-[6vh] flex flex-col items-center gap-2">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            className="text-[var(--fluid-caption)] font-display font-black tracking-[0.6em] text-white uppercase italic mb-2"
                        >
                            제2장 : 마음은 깨져야 비로소 빛이 들어온다
                        </motion.span>
                        <div className="w-16 h-[1px] bg-white opacity-20 mb-4"></div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                        >
                            Entrance I: [조우]
                        </motion.span>
                    </header>

                    <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                        <StoryText
                            text="안개 숲의 막다른 끝, 대지를 짓누르는 거대한 백색 그림자가 당신의 시야를 가로막습니다. 그것은 전설 속의 신수(神獸)였으나, 지금은 상처 입고 굶주린 채 죽음만을 기다리는 비참한 괴물의 형상을 하고 있습니다. <br/><br/> 당신은 얼어붙은 채 그 압도적인 죽음의 냄새와 마주합니다. 당장이라도 도망치고 싶지만, 괴물의 거친 숨소리 사이로 들려오는 건 포효가 아닌 나지막한 신음이었습니다."
                            speed={0.06}
                            className="text-xl sm:text-2xl font-display font-black text-white/90 leading-relaxed italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] px-4"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-[8vh] group flex flex-col items-center gap-2"
                    >
                        <span className="text-white font-display font-black text-2xl italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">용기 내어 다가가기</span>
                        <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Page 1: Connection
    if (narrativePage === 1) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer" onClick={() => setNarrativePage(2)}>
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="space-y-12"
                >
                    <header className="mb-[6vh] flex flex-col items-center gap-2">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                        >
                            Entrance II: [교감]
                        </motion.span>
                    </header>

                    <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                        <StoryText
                            text="한 걸음, 다시 한 걸음. 당신은 본능적인 공포를 누르며 차가운 가시덩굴을 헤치고 그에게 다가갑니다. 가까이서 마주한 그의 가슴팍에는 마을 사람들이 남긴 잔혹한 약탈의 흔적, 깊고 거무스름한 흉터가 끝없이 입을 벌리고 있습니다. <br/><br/> 당신은 떨리는 손으로 주머니 속, 가장 소중하고 따뜻했던 기억이 깃든 무구(無垢)를 꺼냅니다."
                            speed={0.06}
                            className="text-xl sm:text-2xl font-display font-black text-white/80 leading-relaxed italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] px-4"
                        />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3, duration: 2 }}
                        >
                            <StoryText
                                text="&quot;무서워하지 마렴. 누군가를 진심으로 마주하기 위해서는 가장 먼저 자신의 두려움과 싸워야 한단다. 마음은 깨져야 비로소 그 틈 사이로 서로의 빛이 흐를 수 있는 법이니까. 자, 나의 가장 깊은 온기를 네 상처 위에 놓아줄게.&quot;"
                                speed={0.05}
                                delay={4.5}
                                className="text-[var(--fluid-body)] leading-loose font-body italic tracking-widest opacity-60"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-[8vh] group flex flex-col items-center gap-2"
                    >
                        <span className="text-white font-display font-black text-2xl italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">두려움을 딛고 손 내밀기</span>
                        <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Page 2: Intro Narrative
    if (narrativePage === 2) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer" onClick={() => {
                setIsTransitioning(true); // Reuse isTransitioning for fade out
                setTimeout(() => {
                    setNarrativePage(3);
                    setIsTransitioning(false);
                }, 1000);
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -20 : 0 }}
                    transition={{ duration: 1.0 }}
                    className="space-y-12"
                >
                    <header className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-display font-black tracking-[1.2em] text-white/30 uppercase italic">Chapter II. 안개의 잔상: [신의 눈이 되어준 등불]</span>
                        <div className="w-16 h-[1px] bg-white opacity-10"></div>
                    </header>
                    <StoryText
                        text="두 눈을 잃은 신수를 위해 당신은 그의 다정한 눈이 되어 일곱 개의 랜턴을 켭니다. <br/> 등불의 온기가 닿는 곳마다 흑백이었던 풍경 속에 생생한 색채가 되살아나 <br/> 신수의 텅 빈 눈동자에 맺힙니다. <br/> 그는 당신이 비추는 등불을 따라 다시 세상을 꿈꾸기 시작합니다."
                        speed={0.06}
                        className="text-xl sm:text-2xl font-display font-black text-white/90 leading-relaxed italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] px-4"
                    />

                    {/* Interaction Guide */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isTransitioning ? 0 : 1 }}
                        transition={{ delay: 2.5, duration: 1.0 }}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-lg mx-auto"
                    >
                        <div className="flex items-center gap-3 mb-3 justify-center">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase italic">여정의 규칙</span>
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        </div>
                        <p className="text-sm text-stone-400 font-body leading-relaxed tracking-wide">
                            제시되는 문장을 보고, 당신의 마음이 얼마나 공명하는지 <br />
                            <strong>다섯 개의 등불</strong> 중 하나를 선택해 주세요. <br />
                            <span className="text-white/80">각 장면은 15초 이내에 결정해야 합니다.</span> <br />
                            <span className="text-[11px] opacity-60 mt-2 block">(1단계: 전혀 그렇지 않음 ~ 5단계: 매우 그렇다)</span>
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isTransitioning ? 0 : 1 }}
                        transition={{ delay: 3.5, duration: 1.0 }}
                        className="flex flex-col items-center gap-4 pt-4"
                    >
                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse" />
                        <span className="text-[10px] font-display tracking-[0.6em] text-white/30 uppercase italic">OPEN_YOUR_EYES</span>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full flex flex-col items-center font-body overflow-y-auto px-4 touch-pan-y">

            {/* Immersive Header - Condensed */}
            <header className="text-center mb-4 relative z-10 shrink-0 mt-2 h-10 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-[10px] font-display font-black tracking-[0.8em] text-white uppercase block italic"
                >
                    Divine_Frequency
                </motion.span>
                <div className="w-6 h-[1px] bg-white opacity-10 mt-1"></div>
            </header>

            <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pb-4 overflow-visible min-h-0">
                <div className="w-full max-w-4xl flex flex-col items-center gap-y-2">

                    {/* Image Display Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex} // Change image every set of questions
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 1.5 }}
                            className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <img
                                src={currentImage?.src || '/forest_main_bg.jpg'}
                                alt="Forest Remnant"
                                className="w-full h-full object-cover brightness-75"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Question & Choice UI - Compact Stack */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={overallQuestionIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, filter: 'blur(10px)' }}
                            transition={{ duration: 1.2 }}
                            className="w-full max-w-2xl space-y-4 text-center"
                        >
                            {currentQuestion ? (
                                <div className="w-full space-y-6">
                                    <StoryText
                                        key={currentQuestion.id}
                                        text={currentQuestion.text}
                                        speed={0.05}
                                        className="text-[var(--fluid-h2)] font-display font-medium leading-relaxed text-white italic tracking-tight px-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    />

                                    {/* Lantern Container - Z-Index boosted to overlap anything */}
                                    <div className="w-full px-4 pt-4 pb-12 relative z-[100] mb-8">
                                        <LanternScale
                                            min={1}
                                            max={7}
                                            value={currentAnswer}
                                            onChange={handleAnswer}
                                            labels={{ min: '전혀 그렇지 않음', max: '매우 그렇다' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-white/5 font-display text-4xl italic tracking-widest brightness-200">기억을 되살리는 중...</div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>

            {/* Ghostly Progress Markers */}
            <div className="flex justify-center gap-[2vw] shrink-0 pb-6 mt-4 w-full max-w-4xl px-4 flex-wrap z-20">
                {[...Array(images.length * commonQuestions.length)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`w-1 h-1 rounded-full transition-all duration-1000 ${i <= totalAnswered ? 'bg-white' : 'bg-white/20'}`}
                        animate={i === overallQuestionIndex ? {
                            scale: 2,
                            boxShadow: ['0 0 0px white', '0 0 10px white', '0 0 0px white']
                        } : {
                            scale: 1,
                            boxShadow: 'none'
                        }}
                        transition={{ duration: 2, repeat: i === overallQuestionIndex ? Infinity : 0 }}
                    />
                ))}
            </div>

            <AnimatePresence>
                {showInterval && (
                    <NarrativeInterval
                        progress={Math.floor(totalAnswered / 5)}
                        onContinue={() => {
                            setShowInterval(false);
                            proceed();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

export default ImplicitStage;
