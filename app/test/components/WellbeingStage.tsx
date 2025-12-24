import { useState } from 'react';
import { TestData } from '../../data/testData';
import { motion, AnimatePresence } from 'framer-motion';
import LikertScale from './LikertScale';

interface WellbeingStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (data: any) => void;
}

export default function WellbeingStage({ onComplete }: WellbeingStageProps) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const questions = TestData.wellbeingQuestions;

    const handleAnswer = (val: number) => {
        const newAnswers = { ...answers, [currentQuestionIndex]: val };
        setAnswers(newAnswers);

        // Slight delay for visual feedback before moving
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                onComplete({ wellbeingAnswers: newAnswers });
            }
        }, 400);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 font-sans-kr overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 flex justify-between items-end bg-white/50 backdrop-blur border-b border-gray-100 z-40">
                <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Part 04</span>
                    <h2 className="font-serif-kr text-2xl font-black text-gray-950">심리적 웰빙 진단</h2>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Progress</span>
                    <span className="font-black text-black">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full overflow-hidden">
                <motion.div
                    className="h-full bg-black/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-xl bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-gray-100 space-y-12"
                    >
                        <div className="space-y-6 text-center">
                            <div className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                                Question {String(currentQuestionIndex + 1).padStart(2, '0')}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-gray-900 px-4"
                                dangerouslySetInnerHTML={{
                                    __html: questions[currentQuestionIndex].replace(/\*\*(.*?)\*\*/g, '<span class="text-blue-600">$1</span>')
                                }}
                            />
                        </div>

                        <div className="pt-4">
                            <LikertScale
                                value={answers[currentQuestionIndex] || 0}
                                onChange={handleAnswer}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Sub-hint or background decoration */}
                <div className="absolute bottom-12 flex justify-center w-full">
                    <div className="flex gap-1.5">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-4 bg-black/40' : 'w-1.5 bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
