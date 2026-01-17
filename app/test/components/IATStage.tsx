'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestStore } from '@/store/testStore';
import { TestData } from '../../data/testData';
import StoryText from '@/components/StoryText';
import { StageRef } from '../types';

interface IATStageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (data: any) => void;
    setIsWalking?: (walking: boolean, direction?: 'left' | 'right' | 'center') => void;
}

const IATStage = forwardRef<StageRef, IATStageProps>(({ onComplete, setIsWalking }, ref) => {
    const [phase, setPhase] = useState(1);
    const [trials, setTrials] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isDidactic, setIsDidactic] = useState(true);

    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (!isDidactic) {
                if (currentWordIndex > 0) {
                    setCurrentWordIndex(p => p - 1);
                    reactionTimes.current.pop(); // Remove last reaction time
                    return true;
                }
                // Return to instructions of current phase
                setIsDidactic(true);
                setCurrentWordIndex(0);
                reactionTimes.current = []; // Clear data if restarting phase
                return true;
            }
            if (phase > 1) {
                setPhase(p => p - 1);
                return true;
            }
            return false;
        }
    }));
    const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

    const startTimeRef = useRef<number>(0);
    const reactionTimes = useRef<number[]>([]);

    const getPhaseConfig = (p: number) => {
        switch (p) {
            case 1: return { left: { label: "Me", subLabel: "나", cats: ['self'] }, right: { label: "Others", subLabel: "타인", cats: ['other'] }, trials: 12 };
            case 2: return { left: { label: "Receptive", subLabel: "수용적", cats: ['receptive'] }, right: { label: "Repressive", subLabel: "억압적", cats: ['repressive'] }, trials: 12 };
            case 3: return { left: { label: "Me / Receptive", subLabel: "나 / 수용적", cats: ['self', 'receptive'] }, right: { label: "Others / Repressive", subLabel: "타인 / 억압적", cats: ['other', 'repressive'] }, trials: 40 };
            case 4: return { left: { label: "Repressive", subLabel: "억압적", cats: ['repressive'] }, right: { label: "Receptive", subLabel: "수용적", cats: ['receptive'] }, trials: 10 };
            case 5: return { left: { label: "Me / Repressive", subLabel: "나 / 억압적", cats: ['self', 'repressive'] }, right: { label: "Others / Receptive", subLabel: "타인 / 수용적", cats: ['other', 'receptive'] }, trials: 40 };
            default: return null;
        }
    };

    const config = getPhaseConfig(phase);

    useEffect(() => {
        // Set visual stage for Chapter I
        useTestStore.getState().setVisualStage(3);
        if (!config) return;
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
        setTrials(allWords.sort(() => Math.random() - 0.5));
        setCurrentWordIndex(0);
        setIsDidactic(true);
    }, [phase]);

    const startPhase = () => {
        setIsDidactic(false);
        startTimeRef.current = Date.now();
    };

    const handleTap = (side: 'LEFT' | 'RIGHT') => {
        if (isDidactic) return;
        if (currentWordIndex >= trials.length) return;

        const currentWord = trials[currentWordIndex];
        let correctSide = 'UNKNOWN';
        for (const cat of config!.left.cats) {
            // @ts-expect-error - indexing with string
            if (TestData.iatCategories[cat].includes(currentWord)) correctSide = 'LEFT';
        }
        for (const cat of config!.right.cats) {
            // @ts-expect-error - indexing with string
            if (TestData.iatCategories[cat].includes(currentWord)) correctSide = 'RIGHT';
        }

        const isCorrect = side === correctSide;
        const rt = Date.now() - startTimeRef.current;

        setFeedback(isCorrect ? 'NONE' : 'WRONG');
        reactionTimes.current.push(rt);
        setIsWalking?.(true, side === 'LEFT' ? 'left' : 'right');
        setTimeout(() => setIsWalking?.(false, side === 'LEFT' ? 'left' : 'right'), 600);

        setTimeout(() => {
            setFeedback('NONE');
            const nextIndex = currentWordIndex + 1;
            useTestStore.getState().incrementWalkingProgress();
            if (nextIndex < trials.length) {
                setCurrentWordIndex(nextIndex);
                startTimeRef.current = Date.now();
            } else if (phase < 5) {
                setPhase(phase + 1);
            } else {
                setIsWalking?.(false);
                useTestStore.getState().setVisualStage(4); // Move to Chapter II
                onComplete({ iatScores: [...reactionTimes.current] });
            }
        }, 150);
    };

    if (!config) return null;

    if (isDidactic) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 relative font-display text-white" onClick={startPhase}>

                {/* Chapter Revelation - Ethereal Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-10 flex flex-col items-center gap-2"
                >
                    <span className="text-[11px] font-black tracking-[1.2em] text-white/30 uppercase italic">Chapter I. 심장의 울림: [나란히 걷는 심장]</span>
                    <div className="w-16 h-[1px] bg-white opacity-10"></div>
                </motion.div>

                {/* Floating Divine Layout */}
                <div className="w-full max-w-2xl flex flex-col items-center gap-20">

                    {/* Mapping Revelation */}
                    <div className="flex justify-between w-full px-4 items-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 1.5 }}
                            className="flex-1 text-center"
                        >
                            <span className="text-[9px] font-mono tracking-[0.4em] text-stone-500 uppercase block mb-3">Left_Pathway</span>
                            <h3 className="text-4xl sm:text-5xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{config.left.subLabel}</h3>
                        </motion.div>

                        <div className="w-[1px] h-16 bg-white/5"></div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 1.5 }}
                            className="flex-1 text-center"
                        >
                            <span className="text-[9px] font-mono tracking-[0.4em] text-stone-500 uppercase block mb-3">Right_Pathway</span>
                            <h3 className="text-4xl sm:text-5xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{config.right.subLabel}</h3>
                        </motion.div>
                    </div>

                    {/* Instruction Manifestation - Phase-specific narratives */}
                    <div className="space-y-12 text-center">
                        {phase === 1 && (
                            <>
                                <StoryText
                                    key={phase}
                                    text="차갑고 짙은 안개가 당신의 발목을 휘감습니다. 이제 마을의 소음은 들리지 않습니다. 오직 당신의 거친 숨소리만이 들릴 뿐입니다. <br/> <br/> <span class='text-white/80 font-black'>&quot;세상의 모든 소음이 사라진 뒤에야 비로소 진실한 내면의 소리가 들리는 법이란다. 너를 버린 세상을 원망하기보다, 네 안의 가장 고요한 용기를 믿어보렴.&quot;</span>"
                                    speed={0.06}
                                    delay={1.5}
                                    className="text-xl sm:text-2xl text-stone-300 italic font-body tracking-[0.1em] opacity-80"
                                />
                            </>
                        )}
                        {phase === 2 && (
                            <>
                                <StoryText
                                    key={phase}
                                    text="안개 너머에서 희미한 고동 소리가 들려오기 시작합니다. 당신의 발걸음은 무거우나, 안개 너머의 존재가 당신의 온기를 기다리고 있습니다. <br/> <br/> <span class='text-white/80 font-black'>&quot;누군가에게 나를 내어준다는 건 결코 소멸이 아니야. 타인의 차가운 가슴에 네 온기를 채울 때, 너라는 존재의 가치는 비로소 완성되는 것이니까.&quot;</span>"
                                    speed={0.06}
                                    delay={1.5}
                                    className="text-xl sm:text-2xl text-stone-300 italic font-body tracking-[0.1em] opacity-80"
                                />
                            </>
                        )}
                        {phase === 3 && (
                            <>
                                <StoryText
                                    key={phase}
                                    text="이제 안개는 당신의 무릎까지 차올랐습니다. 보이지 않는 거대 존재의 한기가 느껴지지만, 당신이 분류하는 단어들이 빛의 실타래가 되어 길을 만듭니다. <br/> <br/> <span class='text-white/80 font-black'>&quot;공포는 대상을 모를 때 커지는 법이지. 네가 가까이 다가갈수록 저 거대한 괴물은 너의 구원을 갈구하는 연약한 생명일 뿐임을 깨닫게 될 거야.&quot;</span>"
                                    speed={0.06}
                                    delay={1.5}
                                    className="text-xl sm:text-2xl text-stone-300 italic font-body tracking-[0.1em] opacity-80"
                                />
                            </>
                        )}
                        {phase === 4 && (
                            <>
                                <StoryText
                                    key={phase}
                                    text="숲의 적막이 당신을 압도합니다. 하지만 당신의 손끝에는 방금 나누어준 무의식의 온기가 맥박처럼 살아 숨 쉽니다. <br/> <br/> <span class='text-white/80 font-black'>&quot;사랑은 나의 숨결을 쪼개어 상대의 폐부에 밀어 넣는 숭고한 헌신이란다. 네가 건넨 숨결만큼 세상은 다시 따뜻한 색채를 되찾게 될 거야.&quot;</span>"
                                    speed={0.06}
                                    delay={1.5}
                                    className="text-xl sm:text-2xl text-stone-300 italic font-body tracking-[0.1em] opacity-80"
                                />
                            </>
                        )}
                        {phase === 5 && (
                            <>
                                <StoryText
                                    key={phase}
                                    text="안개 숲의 가장 깊은 끝, 거대한 백색 그림자가 당신의 눈앞을 가로막습니다. 신수의 마지막 떨림이 당신의 손바닥에 닿습니다. <br/> <br/> <span class='text-white/80 font-black'>&quot;마지막 숨을 내뱉는 순간을 두려워 마라. 가장 깊은 어둠 속에서 네 진실을 쏟아낼 때, 너는 더 이상 바쳐진 제물이 아닌 새로운 세계를 깨우는 주인이 될 테니.&quot;</span>"
                                    speed={0.06}
                                    delay={1.5}
                                    className="text-xl sm:text-2xl text-stone-300 italic font-body tracking-[0.1em] opacity-80"
                                />
                            </>
                        )}

                        {/* Interaction Guide */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-lg mx-auto"
                        >
                            <div className="flex items-center gap-3 mb-3 justify-center">
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase italic">여정의 규칙</span>
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                            </div>
                            <p className="text-sm text-stone-400 font-body leading-relaxed tracking-wide">
                                화면에 나타나는 단어들이 상단의 <strong>좌측</strong> 혹은 <strong>우측</strong> 카테고리 중 어디에 속하는지, <br />
                                화면의 왼쪽과 오른쪽 영역을 터치하여 <span className="text-white/80">최대한 빠르고 정확하게</span> 분류해 주세요.
                            </p>
                        </motion.div>

                        {/* Seed of Light to Start - Droplet Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 3.5, duration: 2 }}
                            className="pt-8 flex flex-col items-center gap-8 cursor-pointer group"
                        >
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.4, 1],
                                        opacity: [0.1, 0.4, 0.1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
                                />
                                <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white] z-10 animate-pulse" />
                                <div className="absolute w-12 h-12 border border-white/10 rounded-full group-hover:border-white/40 group-hover:scale-125 transition-all duration-1000" />

                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-[-30%] h-[1px] bg-white/5 group-hover:bg-white/20 transition-all duration-1000"
                                />
                            </div>
                            <span className="text-[11px] font-display font-black tracking-[1em] text-white/30 group-hover:text-white transition-all uppercase italic">신수의_심장에_손을_얹고_울림을_깨우기</span>
                        </motion.div>
                    </div>
                </div>

                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-[-1] pointer-events-none bg-radial-vignette"></div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full flex flex-col font-display overflow-hidden py-[5vh] px-[5vw] text-white">

            {/* Top Navigation - Floating Ethereal Borders */}
            <div className="flex justify-between items-start px-8 mb-[8vh] relative z-30">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.8, x: 0 }}
                    className="flex-1 text-left"
                >
                    <span className="text-[var(--fluid-caption)] font-mono tracking-[0.5em] text-stone-500 uppercase block mb-1">Left</span>
                    <div className="text-[var(--fluid-h2)] font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{config.left.subLabel}</div>
                </motion.div>

                <div className="flex flex-col items-center pt-2">
                    <span className="text-[var(--fluid-caption)] font-black tracking-[0.4em] text-stone-600 uppercase mb-2">Phase_Progress</span>
                    <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1 h-1 rounded-full transition-all duration-1000 ${i + 1 <= phase ? 'bg-white' : 'bg-white/20'}`}
                                animate={i + 1 === phase ? {
                                    scale: 2,
                                    boxShadow: ['0 0 0px white', '0 0 8px white', '0 0 0px white']
                                } : {
                                    scale: 1,
                                    boxShadow: 'none'
                                }}
                                transition={{ duration: 2, repeat: i + 1 === phase ? Infinity : 0 }}
                            />
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 0.8, x: 0 }}
                    className="flex-1 text-right"
                >
                    <span className="text-[var(--fluid-caption)] font-mono tracking-[0.5em] text-stone-500 uppercase block mb-1">Right</span>
                    <div className="text-[var(--fluid-h2)] font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{config.right.subLabel}</div>
                </motion.div>
            </div>

            {/* Stimulus Area - Direct Vision */}
            <div className="flex-1 flex flex-col items-center justify-center relative perspective-[1200px] z-20">
                {/* Neural Constellation Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Left Connection */}
                    <motion.path
                        d="M 50% 50% Q 25% 45%, 15% 15%"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 1],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />
                    {/* Right Connection */}
                    <motion.path
                        d="M 50% 50% Q 75% 45%, 85% 15%"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 1],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </svg>

                {/* Touch Zones - Full Screen but Invisible */}
                <div className="absolute inset-0 flex z-40">
                    <div className="flex-1 h-full cursor-pointer" onClick={() => handleTap('LEFT')}></div>
                    <div className="flex-1 h-full cursor-pointer" onClick={() => handleTap('RIGHT')}></div>
                </div>

                {/* The Word Manifestation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentWordIndex}
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(25px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(40px)' }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative z-20 text-center"
                    >
                        {/* Interactive Sparkle on Word */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white/5 blur-3xl rounded-full"
                        />

                        {/* Word Whisper */}
                        <h1 className={`text-[var(--fluid-h1)] font-black tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] italic brightness-125 relative
                            ${feedback === 'WRONG' ? 'text-red-400' : 'text-white'}`}>
                            {trials[currentWordIndex]}
                        </h1>

                        {/* Incorrect Indicator - Subtle Cracked Shadow on Word */}
                        {feedback === 'WRONG' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute -inset-8 border border-red-500/20 blur-xl pointer-events-none"
                                style={{ clipPath: 'polygon(0% 10%, 100% 0%, 90% 100%, 0% 90%)' }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Ground Glow */}
                <div className="absolute bottom-[-10%] w-[30vh] h-[5vh] bg-white/5 blur-[5vh] rounded-full opacity-50"></div>
            </div>

            {/* Immersive Tracker - The Thread of Light */}
            <div className="mt-auto flex flex-col items-center gap-[4vh] relative z-30">
                <div className="w-full max-w-sm h-[1px] bg-white/5 relative overflow-hidden">
                    <motion.div
                        className="h-full bg-white shadow-[0_0_15px_white] opacity-60"
                        animate={{ width: `${(currentWordIndex / trials.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="text-[var(--fluid-caption)] font-black tracking-[1em] text-stone-600 uppercase italic opacity-40">
                    Gazing_Into_Subconscious
                </div>
            </div>

            <style jsx>{`
                .bg-radial-vignette {
                    background: radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
                }
            `}</style>
        </div>
    );
});

export default IATStage;
