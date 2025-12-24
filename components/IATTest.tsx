
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// --- Configuration ---

const WORDS = {
    SELF: ["나의", "나는", "내 안의", "스스로", "나에게", "자신이"],
    OTHER: ["타인", "그들의", "외부", "다른 사람", "세상", "군중"],
    SOCIAL: ["책임감", "신중함", "친절함", "협조적", "계획적", "안정적인"],
    INDIVIDUAL: ["경쟁심", "충동적", "공격적", "냉정한", "창조적", "독립적"],
};

type Category = "SELF" | "OTHER" | "SOCIAL" | "INDIVIDUAL";

interface Stimulus {
    text: string;
    category: Category;
}

const STAGES = [
    {
        id: 1,
        name: "Block 1",
        instruction: "연습: '나' 관련 단어는 왼쪽, '타인' 관련 단어는 오른쪽",
        left: ["SELF"],
        right: ["OTHER"],
        trials: 20,
    },
    {
        id: 2,
        name: "Block 2",
        instruction: "연습: '사회적' 단어는 왼쪽, '개인적' 단어는 오른쪽",
        left: ["SOCIAL"],
        right: ["INDIVIDUAL"],
        trials: 20,
    },
    {
        id: 3,
        name: "Block 3",
        instruction: "본검사: 두 가지 규칙이 합쳐집니다.",
        left: ["SELF", "SOCIAL"],
        right: ["OTHER", "INDIVIDUAL"],
        trials: 40,
    },
    {
        id: 4,
        name: "Block 4",
        instruction: "연습: 위치가 바뀝니다. 주의하세요!",
        left: ["INDIVIDUAL"],
        right: ["SOCIAL"],
        trials: 20, // Reversal practice
    },
    {
        id: 5,
        name: "Block 5",
        instruction: "본검사: 바뀐 규칙으로 진행합니다.",
        left: ["SELF", "INDIVIDUAL"],
        right: ["OTHER", "SOCIAL"],
        trials: 40,
    },
];

// --- Helper Functions ---

const generateTrials = (stageIndex: number): Stimulus[] => {
    const stage = STAGES[stageIndex];
    const stimuli: Stimulus[] = [];
    const leftCats = stage.left as Category[];
    const rightCats = stage.right as Category[];

    const allCats = [...leftCats, ...rightCats];

    for (let i = 0; i < stage.trials; i++) {
        // Randomly pick a category involved in this stage
        const cat = allCats[Math.floor(Math.random() * allCats.length)];
        // Randomly pick a word from that category
        const wordList = WORDS[cat];
        const text = wordList[Math.floor(Math.random() * wordList.length)];
        stimuli.push({ text, category: cat });
    }
    return stimuli;
};

// --- Component ---

interface IATTestProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (results: any) => void;
}

export default function IATTest({ onComplete }: IATTestProps) {
    const [stageIndex, setStageIndex] = useState(0);
    const [trials, setTrials] = useState<Stimulus[]>([]);
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false); // Waiting for user to start block
    const [showError, setShowError] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Timing
    const startTimeRef = useRef<number>(0);
    const resultsRef = useRef<{
        stage: number;
        trial: number;
        word: string;
        category: string;
        rt: number;
        isError: boolean;
    }[]>([]);

    // Initialize trials for the current stage
    useEffect(() => {
        if (stageIndex < STAGES.length) {
            setTrials(generateTrials(stageIndex));
            setCurrentTrialIndex(0);
            setIsStarted(false);
        } else {
            setCompleted(true);
            onComplete(processResults(resultsRef.current));
        }
    }, [stageIndex, onComplete]);

    // Key Handler
    const handleInput = useCallback(
        (direction: "LEFT" | "RIGHT") => {
            if (!isStarted || completed || showError) return;

            const currentStimulus = trials[currentTrialIndex];
            const stage = STAGES[stageIndex];

            // Determine correct direction
            // Cast explicitly to check inclusion
            // Cast explicitly to check inclusion
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isLeft = stage.left.includes(currentStimulus.category as any);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isRight = stage.right.includes(currentStimulus.category as any);

            const isCorrect = (direction === "LEFT" && isLeft) || (direction === "RIGHT" && isRight);
            const now = performance.now();
            const rt = now - startTimeRef.current;

            if (isCorrect) {
                // Record Success
                resultsRef.current.push({
                    stage: stage.id,
                    trial: currentTrialIndex,
                    word: currentStimulus.text,
                    category: currentStimulus.category,
                    rt: rt,
                    isError: false,
                });
                advanceTrial();
            } else {
                // Record Error (but don't advance yet, wait for correction or penalty)
                // Prompt says: "show a red X for 500ms and record the error."
                // Usually IAT forces correction. Or just delays.
                // We will record the error flag. If user corrects it, we still mark it as error trial?
                // Typically we log the initial error.

                // We push a record with isError=true? Or just update the current trial's status?
                // Let's simple model: Show X for 500ms, then advance? Or user must click correct?
                // "Show a red X for 500ms" implies automatic removal of X?
                // I will implement: Show X, wait 500ms, then User must try again? Or auto advance?
                // Usually automatic advance after penalty is simpler for mobile.
                // Let's Auto Advance after 500ms penalty time.

                setShowError(true);
                resultsRef.current.push({
                    stage: stage.id,
                    trial: currentTrialIndex,
                    word: currentStimulus.text,
                    category: currentStimulus.category,
                    rt: rt, // RT includes the time until error
                    isError: true,
                });

                setTimeout(() => {
                    setShowError(false);
                    advanceTrial();
                }, 500);
            }
        },
        [isStarted, completed, showError, trials, currentTrialIndex, stageIndex, advanceTrial]
    );

    const advanceTrial = useCallback(() => {
        if (currentTrialIndex + 1 < trials.length) {
            setCurrentTrialIndex((prev) => prev + 1);
            startTimeRef.current = performance.now(); // Reset timer for next word
        } else {
            // Stage Done
            setStageIndex((prev) => prev + 1);
        }
    }, [currentTrialIndex, trials.length]);

    // Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "e" || e.key === "E" || e.key === "ArrowLeft") handleInput("LEFT");
            if (e.key === "i" || e.key === "I" || e.key === "ArrowRight") handleInput("RIGHT");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleInput]);

    const startBlock = () => {
        setIsStarted(true);
        startTimeRef.current = performance.now();
    };

    if (completed) return <div className="text-center p-10 text-xl font-bold">IAT Test Completed!</div>;

    const currentStage = STAGES[stageIndex];

    // Instruction Screen
    if (!currentStage || !isStarted) {
        if (!currentStage) return null;

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-6 animate-in zoom-in-95 duration-500">
                <div
                    onClick={startBlock}
                    className="w-full max-w-[320px] bg-white rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] p-0 overflow-hidden cursor-pointer active:scale-95 transition-transform relative"
                >
                    {/* Top Section: Badge */}
                    <div className="pt-10 pb-6 text-center">
                        <span className="inline-block text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">
                            단계 0{currentStage.id} / 05
                        </span>
                    </div>

                    {/* Middle Section: Instructions */}
                    <div className="px-8 pb-10 flex flex-col items-center justify-center space-y-8 min-h-[240px]">
                        {/* Left Instruction */}
                        <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">왼쪽</div>
                            <div className="text-3xl font-bold text-gray-900 leading-none mb-1">
                                {currentStage.left.map(c => translateCatKO(c)).join(", ")}
                            </div>
                            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                {currentStage.left.map(c => translateCatEN(c)).join(" / ")}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-8 h-[1px] bg-gray-100"></div>

                        {/* Right Instruction */}
                        <div className="text-center">
                            <div className="text-[10px] text-gray-400 mb-1">오른쪽</div>
                            <div className="text-3xl font-bold text-gray-900 leading-none mb-1">
                                {currentStage.right.map(c => translateCatKO(c)).join(", ")}
                            </div>
                            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                {currentStage.right.map(c => translateCatEN(c)).join(" / ")}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Footer Action */}
                    <div className="bg-gray-50 py-6 px-6 text-center border-t border-gray-100/50">
                        <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                            제시되는 단어를 최대한 빠르고<br />
                            정확하게 분류해 주세요. (총 {currentStage.trials}문항)
                        </p>
                        <div className="inline-block border-b border-gray-900 pb-0.5">
                            <span className="text-xs font-bold text-gray-900">화면을 터치하여 시작</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Testing Screen
    const currentStimulus = trials[currentTrialIndex];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto touch-none select-none">
            {/* Instruction Header - Always visible as reminder */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-4 text-sm font-medium text-gray-500">
                <div className="text-left w-1/2">
                    <span className="text-blue-600 font-bold block text-lg">LEFT</span>
                    {currentStage.left.map(translateCat).join(" / ")}
                </div>
                <div className="text-right w-1/2">
                    <span className="text-blue-600 font-bold block text-lg">RIGHT</span>
                    {currentStage.right.map(translateCat).join(" / ")}
                </div>
            </div>

            {/* Stimulus Area */}
            <div className="flex-1 flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                    {showError ? (
                        <motion.div
                            key="error"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                        >
                            <X className="w-32 h-32 text-red-500" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentTrialIndex} // Re-render on new trial
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900"
                        >
                            {currentStimulus?.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Safe Areas for Touch (Invisible buttons covering sides) */}
            <div className="absolute inset-0 flex z-10 pointer-events-auto">
                <div
                    className="w-1/2 h-full active:bg-black/5 transition-colors"
                    onClick={() => handleInput("LEFT")}
                />
                <div
                    className="w-1/2 h-full active:bg-black/5 transition-colors"
                    onClick={() => handleInput("RIGHT")}
                />
            </div>

            {/* Decorative Progress */}
            <div className="absolute bottom-4 text-xs text-gray-300">
                Trial {currentTrialIndex + 1} / {trials.length}
            </div>
        </div>
    );
}

function translateCat(cat: string) {
    return `${translateCatKO(cat)} (${translateCatEN(cat)})`;
}

function translateCatKO(cat: string) {
    switch (cat) {
        case "SELF": return "나";
        case "OTHER": return "타인";
        case "SOCIAL": return "사회적";
        case "INDIVIDUAL": return "자율적"; // Or '개인적' depending on preference
        default: return cat;
    }
}

function translateCatEN(cat: string) {
    switch (cat) {
        case "SELF": return "ME";
        case "OTHER": return "OTHERS"; // Image says OTHERS plural? Or OTHER. Image says "OTHERS"
        case "SOCIAL": return "SOCIAL";
        case "INDIVIDUAL": return "INDIVIDUAL";
        default: return cat;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processResults(results: any[]) {
    // Simple calculation: Mean RT for congruent vs incongruent
    // Block 3 (Self+Social) vs Block 5 (Self+Individual)
    // Determine user bias.

    // This is a simplified processor.
    // In real IAT, we calculate D-scores. 
    // Here we just pass raw data and basic averages.

    const block3 = results.filter(r => r.stage === 3 && !r.isError);
    const block5 = results.filter(r => r.stage === 5 && !r.isError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgRT3 = block3.reduce((acc: any, r: any) => acc + r.rt, 0) / (block3.length || 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgRT5 = block5.reduce((acc: any, r: any) => acc + r.rt, 0) / (block5.length || 1);

    return {
        raw: results,
        selfSocialRT: avgRT3,
        selfIndividualRT: avgRT5,
        // If Self+Social is faster (lower RT) -> Socially Motivated?
        // If Self+Individual is faster -> Autonomy Motivated?
        bias: avgRT3 < avgRT5 ? "Social" : "Individual",
        diff: avgRT5 - avgRT3
    };
}
