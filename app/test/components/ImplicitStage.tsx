'use client';

import { useState, useEffect } from 'react';
import { useTestStore } from '@/store/testStore';
import { TestData } from '../../data/testData';
import LikertScale from './LikertScale';
import { motion, AnimatePresence } from 'framer-motion';

interface ImplicitStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (data: any) => void;
}

export default function ImplicitStage({ onComplete }: ImplicitStageProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);

    const images = TestData.implicitImages;
    const commonQuestions = TestData.implicitCommonQuestions;

    // Timer logic per question
    useEffect(() => {
        if (isTransitioning) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time up for this question, move top next
                    handleNext();
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentImageIndex, currentQuestionIndex, isTransitioning]);

    const handleNext = () => {
        if (currentQuestionIndex < commonQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(15);
        } else {
            handleImageTransition();
        }
    };

    const handleImageTransition = () => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            setTimeLeft(15);
        } else {
            onComplete({ implicitAnswers: answers });
        }
    };



    // ... inside component ...
    const setStoreImplicitAnswer = useTestStore(state => state.setImplicitAnswer);

    const handleAnswer = (val: number) => {
        if (isTransitioning) return;

        const currentImage = images[currentImageIndex];
        const currentQuestion = commonQuestions[currentQuestionIndex];
        const key = `${currentImage.id}_${currentQuestion.id}`;

        const newAnswers = { ...answers, [key]: val };
        setAnswers(newAnswers);

        // Immediate Store Update
        setStoreImplicitAnswer(key, val);
        console.log(`Saved Answer [${key}]: ${val}`);

        setIsTransitioning(true);
        setTimeout(() => {
            handleNext();
            setIsTransitioning(false);
        }, 400);
    };

    const currentImage = images[currentImageIndex];
    const currentQuestion = commonQuestions[currentQuestionIndex];

    const totalTrials = images.length * commonQuestions.length;
    const currentTrial = (currentImageIndex * commonQuestions.length) + currentQuestionIndex + 1;

    return (
        <div className="h-full flex flex-col bg-[#F6F6F9] overflow-hidden font-sans-kr relative">
            {/* Museum Style Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-center px-8 z-50">
                <div className="flex items-center gap-6">
                    <div className={`flex flex-col items-center justify-center min-w-[60px] py-1 px-3 rounded-full border transition-colors ${timeLeft <= 3 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-black/5 border-black/5 text-black'}`}>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Timer</span>
                        <span className="text-sm font-black tracking-tighter">{timeLeft}s</span>
                    </div>

                </div>
            </div>

            {/* Progress Bar (Museum-like thin line) */}
            <div className="fixed top-[80px] left-0 right-0 h-[2px] bg-gray-100 z-50">
                <motion.div
                    className="h-full bg-black/80"
                    animate={{ width: `${(currentTrial / totalTrials) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <main className="flex-1 flex flex-col pt-24 overflow-y-auto">
                {/* EXHIBITION AREA: Large Framed Image */}
                <div className="flex-[1.2] flex items-center justify-center p-8 relative overflow-hidden min-h-[400px]">
                    {/* Subtle Wall Texture/Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.8)_0%,_rgba(240,240,245,0.5)_100%)]" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10"
                        >
                            {/* The Frame */}
                            <div className="bg-white shadow-[0_40px_70px_-15px_rgba(0,0,0,0.15)] rounded-[2px] ring-1 ring-black/5 overflow-hidden">
                                <div className="relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none z-10" /> {/* Inner shadow */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={currentImage.src}
                                        alt="Psychological Projection"
                                        className="max-h-[60vh] md:max-h-[70vh] w-auto h-auto object-cover transition-transform duration-[60s] ease-linear scale-125 group-hover:scale-110"
                                    />
                                </div>
                            </div>



                            {/* Spotlight effect */}
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_50%_20%,_rgba(255,255,255,0.4)_0%,_transparent_50%)] pointer-events-none" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RESPONSE AREA: Question Panel */}
                <div className="flex-1 bg-white rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.03)] px-8 pt-10 pb-24 flex flex-col items-center">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full mb-8" />

                    <div className="w-full max-w-xl flex-1 flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentImageIndex}_${currentQuestionIndex}`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6 text-center"
                            >
                                <h3
                                    className="text-xl md:text-2xl font-black leading-tight text-gray-900 font-serif-kr min-h-[4rem]"
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
                                />
                                <div className="flex justify-center gap-1.5">
                                    {commonQuestions.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-6 bg-black' : 'w-2 bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-10 space-y-10">
                            <div className="flex flex-col items-center gap-10">
                                <LikertScale
                                    value={answers[`${currentImage.id}_${currentQuestion.id}`] || 0}
                                    onChange={handleAnswer}
                                />


                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
