
"use client";

import React, { useEffect } from "react";
import { useTestStore } from "@/store/testStore";
import IATTest from "@/components/IATTest";
import ImplicitMotiveTest from "@/components/survey/ImplicitMotiveTest";
import ExplicitMotiveTest from "@/components/survey/ExplicitMotiveTest";
import WellbeingTest from "@/components/survey/WellbeingTest";
import TestGuide from "@/components/TestGuide";
import { useRouter } from "next/navigation";
import { ScoringEngine } from "@/lib/ScoringEngine";

export default function HomePage() {
    const { currentStep, setStep, setIatResults, iatResults, implicitAnswers, explicitAnswers, wellbeingAnswers, explicitGoal, setTestResult } = useTestStore();
    const router = useRouter();

    useEffect(() => {
        if (currentStep === "INTRO") {
            const timer = setTimeout(() => {
                router.push('/test');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, router]);

    useEffect(() => {
        // If we land here and step is RESULT, redirect or something?
        // Actually, RESULT is a separate page /result/[id].
        // If step is ANALYZING, trigger calculation.
        if (currentStep === "ANALYZING") {
            performAnalysis();
        }
    }, [currentStep]);

    const performAnalysis = async () => {
        // Helper to calculate mean of specific keys
        const getMean = (source: Record<string, number>, keys: string[]) => {
            if (!keys.length) return 0;
            const validValues = keys.map(k => source[k]).filter(v => v !== undefined);
            if (!validValues.length) return 0;
            return validValues.reduce((a, b) => a + b, 0) / validValues.length;
        };

        // 1. Implicit Scores (36 questions: 6 images * 6 types)
        // Q1, Q2 -> Achievement (Success, Avoidance) - Average
        // Q3, Q4 -> Power (Influence, Fear) - Average
        // Q5, Q6 -> Affiliation (Warmth, Rejection) - Average
        const imgIds = ["img_hero", "img_ruler", "img_lover", "img_creator", "img_helper", "img_sage"];

        const iAchKeys = imgIds.flatMap(img => [`${img}_q1`, `${img}_q2`]);
        const iPowKeys = imgIds.flatMap(img => [`${img}_q3`, `${img}_q4`]);
        const iAffKeys = imgIds.flatMap(img => [`${img}_q5`, `${img}_q6`]);

        const iAch = getMean(implicitAnswers, iAchKeys);
        const iPow = getMean(implicitAnswers, iPowKeys);
        const iAff = getMean(implicitAnswers, iAffKeys);

        // 2. Explicit Scores (18 questions)
        // Mapping based on content:
        // eAch: Q1 (Meaningful Goal), Q15 (Achievement), Q16 (Growth)
        // ePow: Q18 (Status/Extrinsic) - *Proxy as we lack pure power items in 18 list*
        // eAff: Q5 (Trust), Q6 (Support), Q11 (Relationships), Q12 (Help)
        // nAuto: Q2 (Decisions)
        // nComp: Q3 (Doing well), Q4 (Ability)
        // nRela: Q5, Q6 (Same as Affiliation? or distinction?) -> Let's use Q11, Q12 for Aff and Q5, Q6 for Rela? Or mix.
        //        Actually, Q5/6 are "Trust/Support", Q11/12 are "Satisfied/Help". Very similar. I'll use all 4 for both or split.
        //        Split: eAff=Q11,Q12; nRela=Q5,Q6.
        // wWellbeing: Q7 (Positive), Q8 (Optimism), Q9 (Flow), Q10 (Fun), Q13 (Meaning), Q14 (Contribution)
        // cDepletion: Q17 (Burnout)
        // cExternal: Q18 (Status)

        const eAch = getMean(explicitAnswers, ["em1", "em15", "em16"]);
        const ePow = getMean(explicitAnswers, ["em18"]); // Only one item clearly power-related (extrinsic)
        const eAff = getMean(explicitAnswers, ["em11", "em12"]);

        const nAuto = getMean(explicitAnswers, ["em2"]);
        const nComp = getMean(explicitAnswers, ["em3", "em4"]);
        const nRela = getMean(explicitAnswers, ["em5", "em6"]);

        const wWellbeing = getMean(explicitAnswers, ["em7", "em8", "em9", "em10", "em13", "em14"]);
        const cDepletion = getMean(explicitAnswers, ["em17"]);
        const cExternal = getMean(explicitAnswers, ["em18"]);

        const rawScores = {
            iAch, iPow, iAff,
            eAch, ePow, eAff,
            nAuto, nComp, nRela,
            wWellbeing, cDepletion, cExternal
        };

        console.log("Raw Scores Calculated:", rawScores);

        // Calculate Z-Scores
        const scores = ScoringEngine.calculateScores(rawScores);
        const profileData = ScoringEngine.determineProfile(scores); // { primaryProfile, rankings }

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        // 5. Save Global State
        setTestResult({
            scores,
            profile: profileData.primaryProfile, // e.g. "DORMANT_RULER"
            rankings: profileData.rankings
        });

        // 6. Navigate to Result Page
        // Slugify: DORMANT_RULER -> dormant-ruler
        router.push(`/result/${profileData.primaryProfile.toLowerCase().replace(/_/g, '-')}`);
    };

    // ... existing imports

    // ... existing logic

    const renderContent = () => {
        switch (currentStep) {
            case "INTRO":
                return (
                    <div className="fixed inset-0 bg-black flex items-center justify-center">
                        <div className="text-white font-display text-4xl italic tracking-widest animate-pulse">
                            잠재의식의 숲으로...
                        </div>
                    </div>
                );

            case "GUIDE":
                return <TestGuide onStart={() => setStep("IAT")} onBack={() => setStep("INTRO")} />;
            case "IAT":
                return <IATTest onComplete={(res) => { setIatResults(res); setStep("IMPLICIT"); }} />;
            case "IMPLICIT":
                return <ImplicitMotiveTest />;
            case "EXPLICIT":
                return <ExplicitMotiveTest />;
            case "ANALYZING":
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-lg font-bold text-gray-700">분석 중입니다...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            {renderContent()}
        </main>
    );


}
