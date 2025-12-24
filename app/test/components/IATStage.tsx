'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TestData } from '../../data/testData';

interface IATStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (data: any) => void;
}

export default function IATStage({ onComplete }: IATStageProps) {
    const [phase, setPhase] = useState(1);
    const [trials, setTrials] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isDidactic, setIsDidactic] = useState(true); // Instruction mode
    const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

    // Timers
    const startTimeRef = useRef<number>(0);
    const reactionTimes = useRef<number[]>([]);

    // Phase Config
    const getPhaseConfig = (p: number) => {
        switch (p) {
            case 1: return {
                left: { label: "Me", subLabel: "나", cats: ['self'] },
                right: { label: "Others", subLabel: "타인", cats: ['other'] },
                trials: 12
            };
            case 2: return {
                left: { label: "Receptive", subLabel: "수용적", cats: ['receptive'] },
                right: { label: "Repressive", subLabel: "억압적", cats: ['repressive'] },
                trials: 12
            };
            case 3: return {
                left: { label: "Me / Receptive", subLabel: "나 / 수용적", cats: ['self', 'receptive'] },
                right: { label: "Others / Repressive", subLabel: "타인 / 억압적", cats: ['other', 'repressive'] },
                trials: 40
            };
            case 4: return {
                left: { label: "Repressive", subLabel: "억압적", cats: ['repressive'] },
                right: { label: "Receptive", subLabel: "수용적", cats: ['receptive'] },
                trials: 10
            };
            case 5: return {
                left: { label: "Me / Repressive", subLabel: "나 / 억압적", cats: ['self', 'repressive'] },
                right: { label: "Others / Receptive", subLabel: "타인 / 수용적", cats: ['other', 'receptive'] },
                trials: 40
            };
            default: return null;
        }
    };

    const config = getPhaseConfig(phase);

    // Initialize Trials for Phase
    useEffect(() => {
        if (!config) return;

        // Generate trials mixed from categories
        const allWords: string[] = [];
        const needed = config.trials;

        const cats = [...config.left.cats, ...config.right.cats];
        for (let i = 0; i < needed; i++) {
            const cat = cats[i % cats.length];
            // @ts-expect-error - indexing with string
            const wordList = TestData.iatCategories[cat];
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            allWords.push(word);
        }

        // Shuffle
        setTrials(allWords.sort(() => Math.random() - 0.5));
        setCurrentWordIndex(0);
        setIsDidactic(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const startPhase = () => {
        setIsDidactic(false);
        startTimeRef.current = Date.now();
    };

    const handleTap = (side: 'LEFT' | 'RIGHT') => {
        if (isDidactic) return;
        if (currentWordIndex >= trials.length) return;

        const currentWord = trials[currentWordIndex];
        // Determine correct side
        let correctSide = 'UNKNOWN';

        // Check Left
        for (const cat of config!.left.cats) {
            // @ts-expect-error - indexing with string
            if (TestData.iatCategories[cat].includes(currentWord)) correctSide = 'LEFT';
        }
        // Check Right
        for (const cat of config!.right.cats) {
            // @ts-expect-error - indexing with string
            if (TestData.iatCategories[cat].includes(currentWord)) correctSide = 'RIGHT';
        }

        const isCorrect = side === correctSide;
        const rt = Date.now() - startTimeRef.current;

        // Flash Feedback
        setFeedback(isCorrect ? 'NONE' : 'WRONG');
        const flashDuration = 150;

        // Record Data
        reactionTimes.current.push(rt);

        setTimeout(() => {
            setFeedback('NONE');

            const nextIndex = currentWordIndex + 1;
            if (nextIndex < trials.length) {
                setCurrentWordIndex(nextIndex);
                startTimeRef.current = Date.now();
            } else {
                // Phase Complete
                if (phase < 5) {
                    setPhase(phase + 1);
                } else {
                    console.log("IAT Complete. Sending Scores:", reactionTimes.current);
                    onComplete({ iatScores: [...reactionTimes.current] });
                }
            }
        }, flashDuration);
    };


    if (!config) return null;

    // Render Instruction Screen (Glass Card)
    if (isDidactic) {
        return (
            <div className="w-full min-h-[500px] flex items-center justify-center p-6 bg-gray-50/50 backdrop-blur-sm relative overflow-hidden font-sans-kr" onClick={startPhase}>
                {/* Background Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="p-10 rounded-3xl max-w-sm w-full text-center space-y-8 shadow-2xl scale-100 transition-transform active:scale-95 cursor-pointer z-10 bg-white/80 backdrop-blur-md border border-white/20">
                    <div className="text-[10px] font-bold tracking-[0.4em] text-gray-500">단계 0{phase} / 05</div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">왼쪽</div>
                            <div className="text-3xl md:text-4xl font-serif-kr font-black text-gray-900">{config.left.subLabel}</div>
                            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{config.left.label}</div>
                        </div>

                        <div className="h-px w-12 bg-gray-200 mx-auto"></div>

                        <div className="space-y-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">오른쪽</div>
                            <div className="text-3xl md:text-4xl font-serif-kr font-black text-gray-900">{config.right.subLabel}</div>
                            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{config.right.label}</div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                            제시되는 단어를 최대한 빠르고 <br />
                            정확하게 분류해 주세요. (총 {config.trials}문항)
                        </p>
                        <div className="inline-block border-b border-black pb-1 text-[11px] font-black tracking-widest text-black animate-pulse">
                            화면을 터치하여 시작
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[600px] w-full flex overflow-hidden bg-white font-sans-kr">
            {/* Left Side (Zone LEFT) */}
            <div
                className="flex-1 h-full relative overflow-hidden group bg-[#FAFAFA] border-r border-gray-100 active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleTap('LEFT')}
            >
                {/* Mobile/Desktop Touch Area - Full Height */}
                <div className="absolute inset-0 z-0" />

                {/* Top Label Area */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10 text-left">
                    <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">LEFT</div>
                    <div className="flex flex-col gap-1">
                        {config.left.subLabel.split(' / ').map((line, i) => (
                            <div key={i} className={`font-serif-kr font-black text-gray-900 leading-tight transition-all duration-300
                                ${line.length > 3 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-2">{config.left.label}</div>
                </div>
            </div>

            {/* Right Side (Zone RIGHT) */}
            <div
                className="flex-1 h-full relative overflow-hidden group bg-[#FDFDFD] active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleTap('RIGHT')}
            >
                <div className="absolute inset-0 z-0" />

                {/* Top Label Area */}
                <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10 text-right">
                    <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">RIGHT</div>
                    <div className="flex flex-col gap-1 items-end">
                        {config.right.subLabel.split(' / ').map((line, i) => (
                            <div key={i} className={`font-serif-kr font-black text-gray-900 leading-tight transition-all duration-300
                                ${line.length > 3 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-2">{config.right.label}</div>
                </div>
            </div>

            {/* Center Stimulus - Minimalist Float */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="relative group">
                    <div className={`relative min-w-[260px] py-14 px-16 bg-white/90 backdrop-blur-xl rounded-[4px] border border-gray-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-300 transform 
                        ${feedback === 'WRONG' ? 'translate-x-[-8px] border-red-200 bg-red-50/40' : 'translate-x-0'}`}>

                        <h1 key={currentWordIndex} className={`font-serif-kr text-5xl md:text-7xl font-black transition-colors duration-300 animate-in zoom-in-95 fade-in duration-500 ease-out select-none tracking-tight text-center
                            ${feedback === 'WRONG' ? 'text-red-500' : 'text-black'}`}>
                            {trials[currentWordIndex]}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Progress Bar - Minimalist Thin Line */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gray-100 overflow-hidden z-30 rounded-full">
                <motion.div
                    className="h-full bg-black transition-all duration-700 ease-out"
                    animate={{ width: `${((currentWordIndex) / trials.length) * 100}%` }}
                />
            </div>

            {/* Visual Guide Hint */}
            <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 flex justify-between pointer-events-none opacity-10">
                <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Tap</span>
                </div>
                <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Tap</span>
                </div>
            </div>
        </div>
    );
}
