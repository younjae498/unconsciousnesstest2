'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Share2, Home, Download, Lock, Sparkles } from 'lucide-react';
import WebReportView from './components/WebReportView';
import { useTestStore } from '@/store/testStore';
import RadarChartComponent from './components/RadarChartComponent';
import HorizontalBarChartComponent from './components/HorizontalBarChartComponent';
import MindBatteryComponent from './components/MindBatteryComponent';
import TherapyScrollCard, { TherapyType } from './components/TherapyScrollCard';
import AchievementCheckbox from './components/AchievementCheckbox';
import { RESULT_PROFILES } from '../../data/resultProfiles';

// Dynamic import for PDF components to disable SSR
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <p>Loading PDF Viewer...</p>,
    }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <p>Loading Download Link...</p>,
    }
);

const AnalysisReportPDF = dynamic(
    () => import('./components/AnalysisReportPDF'),
    { ssr: false }
);


// Helper: Map Z-Score (-2 to +2) to 0-100 scale
const mapZ = (z: number | undefined) => {
    if (z === undefined) return 50;
    // Map -2..+2 to 0..100
    // -2 -> 0, +2 -> 100
    const val = (z + 2) / 4 * 100;
    return Math.max(0, Math.min(100, Math.round(val)));
};

// Helper: Normalize Keys (Z_ vs z_)
const normalizeScores = (scores: any) => {
    if (!scores) return null;
    return {
        ...scores,
        // Ensure Uppercase Keys available
        Z_iM_Ach: scores.Z_iM_Ach ?? scores.z_iM_Ach,
        Z_eM_Ach: scores.Z_eM_Ach ?? scores.z_eM_Ach,
        Z_iM_Pow: scores.Z_iM_Pow ?? scores.z_iM_Pow,
        Z_eM_Pow: scores.Z_eM_Pow ?? scores.z_eM_Pow,
        Z_iM_Aff: scores.Z_iM_Aff ?? scores.z_iM_Aff,
        Z_eM_Aff: scores.Z_eM_Aff ?? scores.z_eM_Aff,
        Z_MDI_Ach: scores.Z_MDI_Ach ?? scores.z_MDI_Ach,
        Z_MDI_Pow: scores.Z_MDI_Pow ?? scores.z_MDI_Pow,
        Z_MDI_Aff: scores.Z_MDI_Aff ?? scores.z_MDI_Aff,
        Z_PSCI: scores.Z_PSCI ?? scores.z_PSCI,
        Z_N_Auto: scores.Z_N_Auto ?? scores.z_N_Auto,
        Z_N_Comp: scores.Z_N_Comp ?? scores.z_N_Comp,
        Z_N_Rela: scores.Z_N_Rela ?? scores.z_N_Rela,
        Z_W_Wellbeing: scores.Z_W_Wellbeing ?? scores.z_W_Wellbeing,
        Z_C_Depletion: scores.Z_C_Depletion ?? scores.z_C_Depletion,
        Z_C_External: scores.Z_C_External ?? scores.z_C_External,
    };
};


export default function ReportPage() {
    const router = useRouter();
    const { testResult } = useTestStore();
    const [isClient, setIsClient] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false); // Default false for flow test
    const [currentPage, setCurrentPage] = useState(0); // 0: Diagnosis, 1: Analysis, 2: Action
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);

    // Email Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSendEmail = async () => {
        if (!emailInput) return;
        setIsSendingEmail(true);
        try {
            // 1. Generate PDF Blob on the fly
            const { pdf } = await import('@react-pdf/renderer');
            // Assuming AnalysisReportPDF is a default export from the component file
            const AnalysisReportPDFMod = await import('./components/AnalysisReportPDF');
            const AnalysisReportPDF = AnalysisReportPDFMod.default;

            const blob = await pdf(
                <AnalysisReportPDF
                    userData={{ name: testResult?.user?.name || '참여자', date: new Date().toLocaleDateString() }}
                    results={activeResults}
                    aiAnalysis={geminiAnalysis}
                />
            ).toBlob();

            // 2. Convert Blob to Base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;

                // 3. Send to API
                await fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput,
                        resultId: testResult?.id || 'unknown',
                        pdfData: base64data
                    })
                });

                // Simulate delay for better UX
                await new Promise(resolve => setTimeout(resolve, 800));
                setEmailSent(true);
                setIsSendingEmail(false);
            };
        } catch (error) {
            console.error("Email/PDF Error:", error);
            alert('이메일 전송에 실패했습니다. 다시 시도해주세요.');
            setIsSendingEmail(false);
        }
    };


    useEffect(() => {
        setIsClient(true);
        const purchased = localStorage.getItem('hasPurchasedReport');
        if (purchased === 'true') {
            setHasPurchased(true);
        }
    }, [testResult]);

    // Auto-Trigger Analysis on Mount


    // Construct activeResults from testResult or fallback to mock
    // Use useMemo to prevent object recreation on every render
    const activeResults = React.useMemo(() => {
        const mockResults = {
            explicit: { explicitAnswers: { a: 5, b: 5, c: 5 } },
            implicit: { implicitAnswers: { a: 4, b: 4, c: 4 } },
            paima: {
                profileKey: "DORMANT_RULER",
                z_iM_Ach: 2.0, z_eM_Ach: 0.5,
                z_iM_Pow: 2.5, z_eM_Pow: -1.0,
                z_iM_Aff: 0.0, z_eM_Aff: 1.0,
                z_MDI_Ach: 1.5, z_MDI_Pow: 3.5, z_MDI_Aff: 1.0,
                z_PSCI: 2.0,
                z_W_Wellbeing: -0.8
            }
        };

        return testResult ? {
            paima: normalizeScores({
                profileKey: testResult.profile,
                ...testResult.scores
            }),
            explicit: {},
            implicit: {}
        } : mockResults;
    }, [testResult]);

    const paima = activeResults?.paima;
    const profile = paima?.profileKey ? RESULT_PROFILES[paima.profileKey] : RESULT_PROFILES['DORMANT_RULER'];

    // 4. Personalized Sense Solutions (Using 100-item DB)
    const [recommendedSolutions, setRecommendedSolutions] = useState<any[]>([]);

    useEffect(() => {
        const loadSolutions = async () => {
            const { getRecommendedSolutions } = await import('../data/senseSolutions');
            if (activeResults?.paima) {
                const solutions = getRecommendedSolutions(activeResults.paima);
                setRecommendedSolutions(solutions);
            }
        };
        loadSolutions();
    }, [activeResults]);


    // Purchase & Analysis Flow
    const handlePurchase = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            // 1. Mock Payment Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setHasPurchased(true);
            localStorage.setItem('hasPurchasedReport', 'true');

            // 2. Trigger Analysis immediately after purchase
            await handleAnalyze();

        } catch (error) {
            console.error("Purchase Flow Error:", error);
            alert("결제 처리 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnalyze = async () => {
        // Prevent double click
        if (isAnalyzing) return;

        setIsAnalyzing(true);
        try {
            // 1. Call Gemini API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testResultId: testResult?.id || 'mock-id',
                    // Pass scores for context
                    paima: activeResults.paima,
                    explicitGoal: testResult?.answers?.explicitGoal || '' // Pass user goal
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            const analysisResult = data.analysis;

            // 2. Update State (Show Result in UI first)
            setGeminiAnalysis(analysisResult);

            // 3. Generate PDF (Silent Background) - Wrap in try-catch to prevent crashing UI if images missing
            try {
                // Use dynamic import to avoid SSR issues
                const { pdf } = await import('@react-pdf/renderer');
                const AnalysisReportPDFMod = await import('./components/AnalysisReportPDF');
                const AnalysisReportPDF = AnalysisReportPDFMod.default;

                const doc = (
                    <AnalysisReportPDF
                        userData={{ name: testResult?.user?.name || 'User', date: new Date().toLocaleDateString() }}
                        results={activeResults}
                        aiAnalysis={analysisResult} // Pass full object
                    />
                );

                // Check for Blob generation
                // Note: If images in the PDF component are missing/404, this might log errors but should hopefully not crash the main thread if handled.
                // Ideally, AnalysisReportPDF should handle missing images gracefully.
                // For now, we just skip the automatic email send here as we moved it to the manual button.

            } catch (pdfError) {
                console.error("PDF Generation Warning:", pdfError);
                // Do NOT block the user from seeing the text analysis
            }
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("분석 결과를 불러오는 중 문제가 발생했습니다. (API Key 확인 필요)");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ... userData ...

    // ... handleSendEmail ...

    // ... handleDownload ...

    if (!isClient) return null;

    // Dynamic Data Calculation
    const radarData = [
        { subject: '성취', A: mapZ(paima?.Z_iM_Ach), B: mapZ(paima?.Z_eM_Ach), fullMark: 100 },
        { subject: '권력', A: mapZ(paima?.Z_iM_Pow), B: mapZ(paima?.Z_eM_Pow), fullMark: 100 },
        { subject: '친화', A: mapZ(paima?.Z_iM_Aff), B: mapZ(paima?.Z_eM_Aff), fullMark: 100 },
    ];

    const barData = [
        { name: '권력 욕구 차이', value: mapZ(paima?.Z_MDI_Pow), warningLevel: (paima?.Z_MDI_Pow || 0) > 1 },
        { name: '성취 욕구 차이', value: mapZ(paima?.Z_MDI_Ach), warningLevel: (paima?.Z_MDI_Ach || 0) > 1 },
        { name: '친화 욕구 차이', value: mapZ(paima?.Z_MDI_Aff), warningLevel: (paima?.Z_MDI_Aff || 0) > 1 },
    ];

    const positiveEnergy = mapZ(paima?.Z_W_Wellbeing);

    // Therapy Items Data (Restored & Typed)
    const therapyItems = [
        {
            id: "1",
            title: "Style: 권위 있는 슈트",
            description: "구조적이고 각진 실루엣의 테일러드 자켓이나 코트를 착용하세요. 네이비, 차콜 등 깊이 있는 컬러가 당신의 숨겨진 통제 욕구를 건강한 '전문가적 권위'로 표현해줍니다.",
            image: "/dormant_ruler_style_suit_1766363947221.png",
            type: "visual" as const,
            keywords: ["Suit", "Navy", "Authority"]
        },
        {
            id: "2",
            title: "Scent: 시더우드 & 레더",
            description: "묵직하고 스모키한 우드 향이나 가죽 향을 사용하세요. 가벼운 꽃향기보다는 무게감 있는 향이 당신의 내면의 힘을 그라운딩(Grounding) 시켜줍니다.",
            image: "/dormant_ruler_scent.png",
            type: "smell" as const,
            keywords: ["Woody", "Leather", "Grounding"]
        },
        {
            id: "3",
            title: "Texture: 차가운 금속과 가죽",
            description: "메탈 시계, 만년필, 가죽 데스크 매트 등 차갑고 단단하거나 질긴 텍스처의 소품을 가까이 하세요. 이는 당신의 결단력을 감각적으로 자극합니다.",
            image: "/dormant_ruler_texture.png",
            type: "touch" as const,
            keywords: ["Metal", "Cold", "Firm"]
        },
        {
            id: "4",
            title: "Taste: 에스프레소 & 다크 초콜릿",
            description: "단맛이 없는 진한 에스프레소나 쌉싸름한 다크 초콜릿(카카오 70% 이상)을 즐기세요. 깊은 쓴맛은 정신을 번쩍 들게 하고 집중력을 높여줍니다.",
            image: "/dormant_ruler_taste.png",
            type: "taste" as const,
            keywords: ["Bitter", "Espresso", "Focus"]
        },
        {
            id: "5",
            title: "Sound: 첼로 & 저음 베이스",
            description: "바흐의 무반주 첼로 모음곡이나 묵직한 베이스가 강조된 재즈를 들어보세요. 저음의 진동이 당신의 들뜨는 에너지를 차분하게 가라앉혀 줍니다.",
            image: "/dormant_ruler_sound.png",
            type: "auditory" as const,
            keywords: ["Cello", "Bass", "Calm"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans-kr pb-32">
            {/* Header ... */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="font-serif-kr text-xl font-bold text-gray-900">PAIMA <span className="text-blue-600 text-xs align-top">RESULT</span></h1>
                <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <Home className="w-5 h-5" />
                </button>
            </header>

            <main className="p-4 md:p-6 max-w-md mx-auto w-full space-y-6">

                {/* Tab Navigation */}
                <div className="flex bg-gray-200/50 p-1 rounded-xl">
                    {['결과 리포트', '심층 분석', '액션 플랜'].map((tab, idx) => (
                        <button
                            key={tab}
                            onClick={() => setCurrentPage(idx)}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${currentPage === idx
                                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="min-h-[400px] relative">
                    {/* Tab 0: Main Report */}
                    {currentPage === 0 && (
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <WebReportView
                                results={activeResults}
                                isAnalyzing={isAnalyzing}
                                onAnalyze={handleAnalyze} // Not used directly in this flow usually but kept for props
                                geminiAnalysis={geminiAnalysis}
                                radarData={radarData}
                                barData={barData}
                            />
                        </div>
                    )}

                    {/* Tab 1: Deep Analysis */}
                    {currentPage === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {!hasPurchased ? (
                                /* Locked State */
                                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center">
                                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                                        <Lock className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900">심층 분석 리포트</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                                            당신의 무의식에 숨겨진 그림자, 내적 갈등,<br />
                                            그리고 잠재력까지 AI가 깊이있게 분석합니다.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isProcessing}
                                        className="w-full max-w-xs py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                결제 및 분석 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" /> 심층 분석 받아보기 (₩33,000)
                                            </>
                                        )}
                                    </button>
                                </section>
                            ) : isAnalyzing ? (
                                /* Analyzing State */
                                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto text-blue-500 w-8 h-8 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900 animate-pulse">AI가 결과 분석 중입니다</h3>
                                        <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
                                    </div>
                                </section>
                            ) : geminiAnalysis && typeof geminiAnalysis === 'object' && (geminiAnalysis as any).deepAnalysis ? (
                                /* Result State */
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{(geminiAnalysis as any).summary.title}</h3>
                                        <p className="text-sm text-gray-500">{(geminiAnalysis as any).summary.content}</p>
                                    </div>

                                    {/* Persona Card */}
                                    <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-100 relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-3 rounded-full">
                                                    <div className="w-6 h-6 flex items-center justify-center font-bold text-emerald-600">P</div>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{(geminiAnalysis as any).deepAnalysis.persona.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {(geminiAnalysis as any).deepAnalysis.persona.content}
                                            </p>
                                        </div>
                                    </section>

                                    {/* Shadow Card */}
                                    <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-purple-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Sparkles size={100} className="text-purple-500" />
                                        </div>
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-100 p-3 rounded-full">
                                                    <Lock className="w-6 h-6 text-purple-600" />
                                                </div>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <h4 className="text-lg font-bold text-gray-900">{(geminiAnalysis as any).deepAnalysis.shadow.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {(geminiAnalysis as any).deepAnalysis.shadow.content}
                                            </p>
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {(geminiAnalysis as any).deepAnalysis.shadow.keywords.map((kw: string, i: number) => (
                                                    <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100">
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Conflict Card */}
                                    <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-red-100 relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-100 p-3 rounded-full">
                                                    <div className="w-6 h-6 flex items-center justify-center font-bold text-red-600">!</div>
                                                </div>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <h4 className="text-lg font-bold text-gray-900">{(geminiAnalysis as any).deepAnalysis.conflict.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {(geminiAnalysis as any).deepAnalysis.conflict.content}
                                            </p>
                                            <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                                                <div className="bg-red-500 h-full w-[85%] rounded-full"></div>
                                            </div>
                                            <p className="text-xs text-right text-red-500 font-bold">에너지 누수율: 심각</p>
                                        </div>
                                    </section>

                                    {/* Potential Card */}
                                    <section className="bg-gradient-to-br from-blue-50 to-white rounded-[2rem] p-6 shadow-sm border border-blue-100 relative">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-3 rounded-full">
                                                    <Sparkles className="w-6 h-6 text-blue-600" />
                                                </div>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <h4 className="text-lg font-bold text-gray-900">{(geminiAnalysis as any).deepAnalysis.potential.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-blue-200 pl-4 italic">
                                                &quot;{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {(geminiAnalysis as any).deepAnalysis.potential.content}&quot;
                                            </p>
                                            <div className="mt-2 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                <span className="text-xs uppercase tracking-wider text-blue-500 block mb-1">Action Point</span>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <p className="text-sm font-bold text-gray-900">{(geminiAnalysis as any).deepAnalysis.potential.action}</p>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                /* Fallback if Purchased but no Analysis (Should trigger auto, but just in case) */
                                /* Fallback if Purchased but no Analysis */
                                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center">
                                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
                                        <Sparkles className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900">심층 분석 준비 완료</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                                            결제가 완료되었습니다.<br />
                                            이제 AI가 당신의 무의식을 분석합니다.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full max-w-xs py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                분석 생성 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" /> AI 심층 분석 결과 생성하기
                                            </>
                                        )}
                                    </button>
                                </section>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Action Plan */}
                    {currentPage === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">ACTION PLAN</h3>
                                <p className="text-xs text-gray-500">무의식을 통합하고 성장하는 구체적 로드맵</p>
                            </div>

                            <section className="relative rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 bg-white">
                                <div className={`p-6 space-y-8 transition-all duration-500 ${(!hasPurchased || !(geminiAnalysis as any)?.action_plan) ? 'blur-md opacity-40 pointer-events-none select-none grayscale-[0.5]' : ''}`}>

                                    {/* Goal Support */}
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-800 mb-2">💡 목표 지원 메시지</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(geminiAnalysis as any)?.action_plan?.goal_support}
                                        </p>
                                    </div>

                                    {/* Mind Battery & Sense Solutions */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-900 px-2 border-l-4 border-gray-900">Five Senses Therapy</h4>
                                        <MindBatteryComponent positivePercentage={positiveEnergy} />

                                        {/* AI Sense Text List */}
                                        {/* Assuming sense_solutions is an object */}
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(geminiAnalysis as any)?.action_plan?.sense_solutions && (
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {Object.entries((geminiAnalysis as any).action_plan.sense_solutions).map(([sense, desc]: [string, any]) => (
                                                    <div key={sense} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl">
                                                        <span className="text-xs font-bold uppercase w-16 text-gray-400 mt-0.5">{sense}</span>
                                                        <span className="text-gray-800 flex-1">{desc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="w-full h-px bg-gray-100 my-4"></div>
                                        <TherapyScrollCard items={recommendedSolutions} />
                                    </div>

                                    {/* If-Then Plans */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-gray-900 px-2 border-l-4 border-gray-900">If-Then Implementation</h4>
                                        <div className="space-y-3">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(geminiAnalysis as any)?.action_plan?.if_then_plans?.map((plan: any, idx: number) => (
                                                <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{plan.category}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded leading-tight h-fit">If</span>
                                                            <p className="text-sm text-gray-600 font-medium leading-tight">{plan.situation}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded leading-tight h-fit">Then</span>
                                                            <p className="text-sm text-gray-900 font-bold leading-tight">{plan.action}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Closing Message */}
                                    <div className="bg-gray-900 text-white p-8 rounded-2xl text-center space-y-4 mt-8">
                                        <Sparkles className="w-8 h-8 mx-auto text-yellow-400 animate-pulse" />
                                        <p className="font-serif-kr text-lg leading-relaxed">
                                            &quot;{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(geminiAnalysis as any)?.action_plan?.closing_message}&quot;
                                        </p>
                                    </div>
                                </div>

                                {(!hasPurchased || !(geminiAnalysis as any)?.action_plan) && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-white/10 to-white/60 backdrop-blur-[2px]">
                                        <div className="bg-white/90 p-6 rounded-3xl shadow-xl text-center border border-gray-100 max-w-[240px] animate-in zoom-in-95 duration-300">
                                            {!hasPurchased ? (
                                                <>
                                                    <div className="bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                                        <Lock className="w-5 h-5 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-1">프리미엄 리포트</h4>
                                                    <p className="text-xs text-gray-500 mb-4 font-medium">심리적 심층 자원과<br />액션 플랜을 확인하세요</p>
                                                    <button
                                                        onClick={handlePurchase}
                                                        disabled={isProcessing}
                                                        className="w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-black transition-colors"
                                                    >
                                                        {isProcessing ? '처리 중...' : '지금 잠금 해제하기'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-1">분석 결과 생성 필요</h4>
                                                    <p className="text-xs text-gray-500 mb-4 font-medium">AI 심층 분석을 완료하면<br />맞춤형 솔루션이 제공됩니다.</p>
                                                    <button
                                                        onClick={() => setCurrentPage(1)}
                                                        className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        분석하러 가기
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer Spacer */}
                <div className="h-32"></div>

            </main>

            {/* Bottom Action Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 pb-8 rounded-t-[2.0rem] shadow-[0_-5px_30px_rgba(0,0,0,0.05)]">
                <div className="max-w-md mx-auto">
                    {!hasPurchased ? (
                        <button
                            onClick={handlePurchase}
                            disabled={isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 animate-pulse"
                        >
                            {isProcessing ? (
                                '처리 중...'
                            ) : (
                                <><Lock className="w-4 h-4" /> 심층 분석 받아보기 (₩33,000)</>
                            )}
                        </button>
                    ) : (
                        // Only show Email button if Analysis is READY
                        // Check if geminiAnalysis and deepAnalysis exist
                        (geminiAnalysis as any)?.deepAnalysis ? (
                            <button
                                onClick={() => setShowEmailModal(true)}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    이메일로 리포트 받기
                                </div>
                            </button>
                        ) : null
                    )}
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">리포트 전송</h3>
                            <button onClick={() => setShowEmailModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!emailSent ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">이메일 주소</label>
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="example@email.com"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed px-1">
                                    * 입력하신 이메일로 PDF 리포트가 발송됩니다.<br />
                                    * 발송에는 약 5-10초가 소요될 수 있습니다.
                                </p>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={!emailInput || isSendingEmail}
                                    className="w-full py-4 bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
                                >
                                    {isSendingEmail ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        '전송하기'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">발송 완료!</h4>
                                    <p className="text-xs text-gray-500 mt-1">이메일함을 확인해주세요.</p>
                                </div>
                                <button
                                    onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                                    className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 mt-4"
                                >
                                    닫기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
