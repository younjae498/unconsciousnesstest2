'use client';

import { useState } from 'react';
import { useTestStore } from '@/store/testStore';
import { TestData } from '../../data/testData';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LikertScale from './LikertScale';

interface ExplicitStageProps {
    onComplete: (data: any) => void;
}

export default function ExplicitStage({ onComplete }: ExplicitStageProps) {
    const [phase, setPhase] = useState<'PRIMING' | 'SURVEY'>('PRIMING');
    const [goal, setGoal] = useState('');
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const questions = TestData.explicitQuestions;

    const handleGoalSubmit = () => {
        if (goal.trim().length > 0) {
            setPhase('SURVEY');
        }
    };



    // ... inside component ...
    const setStoreExplicitAnswer = useTestStore(state => state.setExplicitAnswer);

    const handleAnswer = (val: number) => {
        const newAnswers = { ...answers, [currentQuestionIndex]: val };
        setAnswers(newAnswers);

        // Immediate Store Update
        setStoreExplicitAnswer(String(currentQuestionIndex), val);
        console.log(`Saved Explicit Answer [${currentQuestionIndex}]: ${val}`);

        // Slight delay for visual feedback of selection before moving
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                onComplete({ explicitGoal: goal, explicitAnswers: newAnswers });
            }
        }, 400);
    };

    if (phase === 'PRIMING') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-y-auto bg-[#FBFBFE] font-sans-kr">
                {/* Decorative Background Glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[20%] right-[-10%] w-64 h-64 bg-amber-50 rounded-full blur-[100px] opacity-60"></div>
                    <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                </div>

                <div className="w-full max-w-lg space-y-12 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-[10px] font-black tracking-[0.3em] text-amber-600 uppercase border border-amber-100/50">
                            Part 03 : Conscious Goals
                        </div>
                        <div className="space-y-4">
                            <h2 className="font-serif-kr text-3xl md:text-4xl font-black leading-snug text-gray-950 tracking-tight">
                                <span className="text-amber-600">최근에</span> 당신이 달성하고 싶은 <br />
                                가장 중요한 목표는 무엇인가요?
                            </h2>
                            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                                예: 승진, 새로운 기술 습득, <br />
                                좋은 관계 맺기 등 자유롭게 적어주세요.
                            </p>
                        </div>
                    </div>

                    <div className="relative group max-w-md mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-amber-100/20 via-blue-100/20 to-amber-100/20 rounded-[2rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000"></div>
                        <input
                            type="text"
                            className="relative w-full bg-white/40 backdrop-blur-md border-b-2 border-gray-200 focus:border-amber-400 py-6 text-2xl md:text-3xl font-serif-kr text-center outline-none transition-all placeholder:text-gray-200 font-bold focus:scale-[1.02]"
                            placeholder="이곳에 목표를 새겨보세요..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
                            autoFocus
                        />
                        <div className="mt-6 text-[11px] text-gray-400 font-bold tracking-widest opacity-80 leading-relaxed uppercase">
                            상세하게 적어주실수록 <br />
                            도움이 되는 리포트를 제공해 드릴 수 있습니다
                        </div>
                    </div>

                    <div className="pt-8 animate-in fade-in duration-1000 fill-mode-forwards z-50">
                        <button
                            onClick={handleGoalSubmit}
                            disabled={goal.length === 0}
                            className="group relative px-12 py-5 bg-black text-white rounded-2xl text-[13px] font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:translate-y-4 shadow-2xl hover:shadow-xl"
                        >
                            <span className="relative z-10 flex items-center gap-3 uppercase">
                                진단 시작하기
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 font-sans-kr overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 flex justify-between items-end bg-white/50 backdrop-blur border-b border-gray-100 z-40">
                <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Part 03</span>
                    <h2 className="font-serif-kr text-2xl font-black text-gray-950">자기 보고 식별</h2>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Target Goal</span>
                    <span className="font-bold text-amber-600 text-sm truncate max-w-[150px]">{goal}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full overflow-hidden">
                <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-xl bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 space-y-12"
                    >
                        <div className="space-y-6 text-center">
                            <div className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                                Question {String(currentQuestionIndex + 1).padStart(2, '0')}
                            </div>
                            {questions && questions[currentQuestionIndex] && (
                                <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-gray-900"
                                    dangerouslySetInnerHTML={{
                                        __html: questions[currentQuestionIndex].replace(/\*\*(.*?)\*\*/g, '<span class="text-amber-600">$1</span>')
                                    }}
                                />
                            )}
                        </div>

                        <div className="pt-4">
                            <LikertScale
                                value={answers[currentQuestionIndex] || 0}
                                onChange={handleAnswer}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Counter */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-300 tracking-[0.4em] uppercase">
                    {currentQuestionIndex + 1} / {questions.length}
                </div>
            </main>
        </div>
    );
}
