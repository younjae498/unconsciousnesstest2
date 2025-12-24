'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import IntroStage from './components/IntroStage';
import IATStage from './components/IATStage';
import ImplicitStage from './components/ImplicitStage';
import ExplicitStage from './components/ExplicitStage';
import WellbeingStage from './components/WellbeingStage';
import { useTestStore } from '@/store/testStore';
import { calculatePaimaScores } from '@/lib/scoring';
import { determineDetailedProfile } from '@/lib/profiling';

type TestStage = 'INTRO' | 'IAT' | 'IMPLICIT' | 'EXPLICIT' | 'WELLBEING';

export default function TestPage() {
    const router = useRouter();
    const {
        currentStep: currentStage, setStep: setStage, setTestResult,
        implicitAnswers, explicitAnswers, wellbeingAnswers, iatResults, explicitGoal,
        setIatResults, setImplicitAnswer, setExplicitAnswer, setWellbeingAnswer, setExplicitGoal
    } = useTestStore();

    const stages: TestStage[] = ['INTRO', 'IAT', 'IMPLICIT', 'EXPLICIT', 'WELLBEING'];
    const stageTitles: Record<TestStage, string> = {
        'INTRO': '검사 소개',
        'IAT': '무의식 반응 검사',
        'IMPLICIT': '투사적 이미지 검사',
        'EXPLICIT': '자기 보고 식별',
        'WELLBEING': '마음 건강 분석'
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleBack = () => {
        const currentIndex = stages.indexOf(currentStage as TestStage);
        if (currentIndex > 0) {
            setStage(stages[currentIndex - 1]);
        } else {
            router.back();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleStageComplete = async (stageResult: any) => {
        const currentIndex = stages.indexOf(currentStage as TestStage);

        // Update specific stage result in store
        // Note: setStageResult is sync but the hook value updates on next render.
        if (currentStage === 'IAT') {
            console.log("Saving IAT Results to Store:", stageResult);
            setIatResults(stageResult);
        }
        else if (currentStage === 'IMPLICIT') {
            // Handle Implicit Results (Dictionary of scores)
            if (stageResult && typeof stageResult === 'object') {
                Object.entries(stageResult).forEach(([k, v]) => setImplicitAnswer(k, v as number));
            }
        }
        else if (currentStage === 'EXPLICIT') {
            if (stageResult.answers) {
                Object.entries(stageResult.answers).forEach(([k, v]) => setExplicitAnswer(k, v as number));
            }
            if (stageResult.explicitGoal) {
                setExplicitGoal(stageResult.explicitGoal);
            }
        }
        else if (currentStage === 'WELLBEING') {
            if (stageResult && typeof stageResult === 'object') {
                Object.entries(stageResult).forEach(([k, v]) => setWellbeingAnswer(k, v as number));
            }
        }

        if (currentIndex < stages.length - 1) {
            setStage(stages[currentIndex + 1]);
        } else {
            // --- FINISH TEST LOGIC ---
            // Construct full data including the just-submitted wellbeing result
            const finalWellbeingAnswers = currentStage === 'WELLBEING' ? stageResult.wellbeingAnswers : wellbeingAnswers;

            // Retrieve goal from store (it was set above or previously)

            console.log("DEBUG: Constructing Raw Data. Store iatResults:", iatResults);

            const rawData = {
                implicitAnswers,
                explicitAnswers,
                wellbeingAnswers: finalWellbeingAnswers,
                iatAnswers: iatResults?.iatScores,
                explicitGoal: explicitGoal // Add Goal to rawData
            };

            console.log("Calculating Scores with:", rawData);
            const scores = calculatePaimaScores(rawData);

            // Determine Profile Key
            const { determineDetailedProfile } = await import('@/lib/profiling');
            const profileKey = determineDetailedProfile(scores);

            console.log("Calculated Scores:", scores);
            console.log("Determined Profile:", profileKey);

            // Update Store with Scores & Profile
            setTestResult({
                scores,
                profile: profileKey,
                timestamp: new Date().toISOString(),
                answers: rawData // Store raw answers including goal
            });

            // Attempt Save to DB
            try {
                await fetch('/api/result/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scores,
                        profileKey,
                        answers: rawData, // explicitGoal is now inside answers
                    })
                });
            } catch (e) {
                console.warn('Save failed - continuing to report', e);
            }

            // Finish (sets finished flag)
            setStage('RESULT');
            router.push('/report');
        }
    };


    const getStageComponent = () => {
        switch (currentStage) {
            case 'INTRO':
                return <IntroStage onComplete={() => handleStageComplete({})} />;
            case 'IAT':
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <IATStage onComplete={(data: any) => handleStageComplete(data)} />;
            case 'IMPLICIT':
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <ImplicitStage onComplete={(data: any) => handleStageComplete(data)} />;
            case 'EXPLICIT':
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <ExplicitStage onComplete={(data: any) => handleStageComplete(data)} />;
            case 'WELLBEING':
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <WellbeingStage onComplete={(data: any) => handleStageComplete(data)} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans pb-safe flex flex-col">
            {/* Header - HIDDEN on Intro */}
            {currentStage !== 'INTRO' && (
                <header className="h-14 flex items-center justify-center relative px-4">
                    <button
                        onClick={handleBack}
                        className="absolute left-4 p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="font-bold text-sm text-gray-500">
                        {stageTitles[currentStage as TestStage]}
                    </div>
                </header>
            )}

            {/* Main Card Content */}
            {/* If Intro: Full width, no padding. Else: Card style */}
            <main className={`flex-1 flex items-center justify-center ${currentStage === 'INTRO' ? 'p-0' : 'px-6 pb-12'}`}>
                <div className={`w-full relative ${currentStage === 'INTRO' ? '' : 'max-w-md bg-white rounded-[2.5rem] p-6 shadow-sm min-h-[60vh] flex flex-col justify-center'}`}>
                    {getStageComponent()}
                </div>
            </main>
        </div>
    );
}
