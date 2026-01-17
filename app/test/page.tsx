'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import IntroStage from './components/IntroStage';
import IATStage from './components/IATStage';
import ImplicitStage from './components/ImplicitStage';
import ExplicitStage from './components/ExplicitStage';
import WellbeingStage from './components/WellbeingStage';
import ResultStage from './components/ResultStage';
import { useTestStore } from '@/store/testStore';
import { calculatePaimaScores } from '@/lib/scoring';


import TestBookFrame from '@/components/TestBookFrame';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

type TestStage = 'INTRO' | 'IAT' | 'IMPLICIT' | 'EXPLICIT' | 'WELLBEING' | 'RESULT';

import { StageRef } from './types';

export default function TestPage() {
    const router = useRouter();
    const {
        currentStep: currentStage, setStep: setStage, setTestResult,
        implicitAnswers, explicitAnswers, wellbeingAnswers, iatResults, explicitGoal,
        stareData, walkingProgress, visualStage,
        setIatResults, setImplicitAnswer, setExplicitAnswer, setWellbeingAnswer, setExplicitGoal,
        updateStareData, incrementWalkingProgress, setVisualStage
    } = useTestStore();

    const stageRef = useRef<StageRef>(null);

    const stages: TestStage[] = ['INTRO', 'IAT', 'IMPLICIT', 'EXPLICIT', 'WELLBEING'];
    const stageTitles: Record<TestStage, string> = {
        'INTRO': 'Prologue: Introduction',
        'IAT': 'Chapter I: The Unconscious Pulse',
        'IMPLICIT': 'Chapter II: The Image Projector',
        'EXPLICIT': 'Chapter III: Conscious Echoes',
        'WELLBEING': 'Chapter IV: Soul Reflection',
        'RESULT': 'Epilogue: Reawakened Guardian'
    };

    const [isEntering, setIsEntering] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const [walkingDirection, setWalkingDirection] = useState<'left' | 'right' | 'center'>('center');
    const [mounted, setMounted] = useState(false);

    // Cinematic Panning & Prism Tracking
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springX = useSpring(mouseX, { damping: 30, stiffness: 150 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 150 });

    // Background Panning (Low sensitivity)
    const rotateX = useTransform(springY, [0, 1], [2, -2]);
    const rotateY = useTransform(springX, [0, 1], [-2, 2]);
    const backgroundX = useTransform(springX, [0, 1], ['49%', '51%']);
    const backgroundY = useTransform(springY, [0, 1], ['49%', '51%']);

    // Prism Shader Displacement Tracking
    const prismX = useTransform(springX, [0, 1], [0, 100]);
    const prismY = useTransform(springY, [0, 1], [0, 100]);

    // Spotlight Background (Interaction follow)
    const spotlightBg = useTransform(
        [springX, springY],
        ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, transparent 0%, rgba(0,0,0,0.1) 40%)`
    );

    useEffect(() => {
        setMounted(true);

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            mouseX.set(clientX / window.innerWidth);
            mouseY.set(clientY / window.innerHeight);
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma !== null && e.beta !== null) {
                // Map gamma (left/right tilt) to mouseX: -45 to 45 degrees -> 0 to 1
                const x = (e.gamma + 45) / 90;
                // Map beta (forward/back tilt) to mouseY: 0 to 90 degrees -> 0 to 1
                const y = (e.beta - 20) / 70;
                mouseX.set(Math.max(0, Math.min(1, x)));
                mouseY.set(Math.max(0, Math.min(1, y)));
            }
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchstart', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchstart', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [mouseX, mouseY]);

    // Active Stare Tracking during Walking Bridge
    useEffect(() => {
        if (!isWalking) return;

        const interval = setInterval(() => {
            const currentX = mouseX.get();
            // Center is 0.5. Monster area is roughly 0.35 to 0.65.
            if (currentX > 0.35 && currentX < 0.65) {
                updateStareData('monster', 100);
            } else {
                updateStareData('forest', 100);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isWalking, mouseX, updateStareData]);

    if (!mounted) return null;

    const handleBack = () => {
        if (stageRef.current?.goBack()) {
            return;
        }

        const currentIndex = stages.indexOf(currentStage as TestStage);
        if (currentIndex > 0) {
            setStage(stages[currentIndex - 1]);
        } else {
            router.back();
        }
    };

    const handleStageComplete = (stageResult: any) => {
        // Trigger 3-second "Walking Bridge"
        setIsWalking(true);
        setTimeout(async () => {
            await processStageChange(stageResult);
            setIsWalking(false);
        }, 3000);
    };

    const processStageChange = async (stageResult: any) => {
        const currentIndex = stages.indexOf(currentStage as TestStage);
        if (currentStage === 'IAT') setIatResults(stageResult);
        else if (currentStage === 'IMPLICIT') {
            if (stageResult && typeof stageResult === 'object') {
                Object.entries(stageResult).forEach(([k, v]) => {
                    setImplicitAnswer(k, v as number);
                    incrementWalkingProgress(); // Increase walking speed
                });
            }
        }
        else if (currentStage === 'EXPLICIT') {
            if (stageResult.explicitAnswers) {
                Object.entries(stageResult.explicitAnswers).forEach(([k, v]) => {
                    setExplicitAnswer(k, v as number);
                    incrementWalkingProgress(); // Increase walking speed
                });
            }
            if (stageResult.explicitGoal) setExplicitGoal(stageResult.explicitGoal);
        }
        else if (currentStage === 'WELLBEING') {
            if (stageResult && typeof stageResult === 'object') {
                Object.entries(stageResult).forEach(([k, v]) => {
                    setWellbeingAnswer(k, v as number);
                    incrementWalkingProgress(); // Increase walking speed
                });
            }
        }

        if (currentIndex < stages.length - 1) {
            setStage(stages[currentIndex + 1]);
        } else {
            // ... scoring logic ...
            const finalWellbeingAnswers = currentStage === 'WELLBEING' ? stageResult : wellbeingAnswers;
            const rawData = {
                implicitAnswers,
                explicitAnswers,
                wellbeingAnswers: finalWellbeingAnswers,
                iatAnswers: iatResults?.iatScores,
                explicitGoal: explicitGoal,
                stareData: stareData // Added this
            };
            const scores = calculatePaimaScores(rawData);
            const { determineDetailedProfile } = await import('@/lib/profiling');
            const profileKey = determineDetailedProfile(scores);

            setTestResult({
                scores,
                profile: profileKey,
                timestamp: new Date().toISOString(),
                answers: rawData
            });

            try {
                await fetch('/api/result/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scores, profileKey, answers: rawData })
                });
            } catch (e) {
                console.warn('Save failed', e);
            }
            setStage('RESULT');
            // router.push('/report'); // commented out to show ResultStage
        }
    };

    const getStageComponent = () => {
        const setIsWalkingDirectional = (walking: boolean, direction: 'left' | 'right' | 'center' = 'center') => {
            setWalkingDirection(direction);
            setIsWalking(walking);
        };

        switch (currentStage) {
            case 'INTRO': return <IntroStage ref={stageRef} onComplete={() => handleStageComplete({})} />;
            case 'IAT': return <IATStage ref={stageRef} onComplete={(data: any) => handleStageComplete(data)} setIsWalking={setIsWalkingDirectional} />;
            case 'IMPLICIT': return <ImplicitStage ref={stageRef} onComplete={(data: any) => handleStageComplete(data)} setIsWalking={setIsWalkingDirectional} />;
            case 'EXPLICIT': return <ExplicitStage ref={stageRef} onComplete={(data: any) => handleStageComplete(data)} setIsWalking={setIsWalkingDirectional} />;
            case 'WELLBEING': return <WellbeingStage ref={stageRef} onComplete={(data: any) => handleStageComplete(data)} setIsWalking={setIsWalkingDirectional} />;
            case 'RESULT' as any:
                const result = useTestStore.getState().testResult;
                const defaultScores: any = {
                    Z_PSCI: 0, Z_MDI_Ach: 0, Z_MDI_Pow: 0, Z_MDI_Aff: 0,
                    Z_iM_Ach: 0, Z_iM_Pow: 0, Z_iM_Aff: 0,
                    Z_eM_Ach: 0, Z_eM_Pow: 0, Z_eM_Aff: 0,
                    Z_N_Auto: 0, Z_N_Comp: 0, Z_N_Rela: 0, Z_W_Wellbeing: 0,
                    Z_C_Depletion: 0, Z_C_External: 0
                };
                return <ResultStage scores={result?.scores || defaultScores} profile={result?.profile || 'UNKNOWN'} />;
            default: return null;
        }
    };

    const getDynamicBackground = () => {
        if (currentStage === 'IAT') return '/71.png';
        return '';
    };

    return (
        <div
            className="h-screen w-full bg-stone-950 text-white font-sans flex flex-col relative overflow-hidden transition-all duration-[2000ms] ease-in-out"
        >

            {/* Interactive Spotlight (Pointer following without distortion) */}
            <motion.div
                className="fixed inset-0 z-[100] pointer-events-none"
                style={{
                    background: spotlightBg,
                }}
            />

            {/* Global Theme Filters: Film Grain & Ethereal Mist */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay noise-bg" />

            {/* Stage-specific Overlay Color - Fragile Divinity Logic */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-all duration-[2000ms] 
                ${currentStage === 'IMPLICIT' ? 'bg-stone-800/20' :
                    'bg-slate-900/10'}`}
                style={{ opacity: isEntering ? 0 : 1 }}
            />

            {/* Back Button - Prism Fragment */}
            <button
                onClick={handleBack}
                className="fixed top-8 left-8 z-[100] group outline-none"
            >
                <div className="relative flex items-center gap-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-2xl transition-all duration-700 group-hover:bg-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <motion.div
                        whileHover={{ scale: 1.2, x: -2 }}
                        className="relative flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white/20 rounded-full blur-md"
                        />
                    </motion.div>
                    <span className="text-[10px] font-display font-black tracking-[0.4em] text-white/30 group-hover:text-white transition-colors uppercase italic">BACK</span>

                    {/* Interactive Shimmer */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]"
                    />
                </div>
            </button>

            <main className="h-full w-full flex items-center justify-center relative z-10">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,900;1,400;1,900&display=swap');
                    
                    :root {
                        --fluid-h1: clamp(2.5rem, 8vh + 1rem, 5rem);
                        --fluid-h2: clamp(1.5rem, 5vh + 0.5rem, 3rem);
                        --fluid-body: clamp(0.9rem, 1.2vh + 0.2rem, 1.1rem);
                        --fluid-caption: clamp(0.7rem, 1vh, 0.9rem);
                    }

                    .font-display { font-family: 'Playfair Display', serif; }
                    .font-body { font-family: 'Caveat', cursive; }

                    .noise-bg {
                        background-image: url("https://www.transparenttextures.com/patterns/stardust.png");
                    }

                    body {
                        overflow: hidden;
                        touch-action: none;
                    }
                `}</style>
                <TestBookFrame
                    title={stageTitles[currentStage as TestStage]}
                    stage={currentStage}
                    mouseX={springX}
                    mouseY={springY}
                    isWalking={isWalking}
                    walkingDirection={walkingDirection}
                    walkingProgress={walkingProgress}
                    visualStage={visualStage}
                    backgroundImage={getDynamicBackground()}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStage}
                            initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                            className="w-full h-full relative z-10 flex flex-col items-center justify-start"
                        >
                            {getStageComponent()}
                        </motion.div>
                    </AnimatePresence>
                </TestBookFrame>
            </main>
        </div>
    );
}
