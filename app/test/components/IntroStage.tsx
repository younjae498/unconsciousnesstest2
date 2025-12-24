'use client';

import React from 'react';

interface IntroStageProps {
    onComplete: () => void;
}

export default function IntroStage({ onComplete }: IntroStageProps) {
    return (
        <div className="w-full min-h-[85vh] flex flex-col bg-[#F9FAFB] text-gray-900 font-sans pb-32 relative -mx-6 -my-6 sm:mx-0 sm:my-0 text-center">

            {/* Header */}
            <header className="pt-10 px-6 pb-6 flex justify-center items-center h-20">
                <div className="px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-900">Psychology Lab</span>
                </div>
            </header>

            <main className="flex-1 px-6 pt-4 flex flex-col items-center animate-in slide-in-from-bottom-5 fade-in duration-700">

                {/* Headline */}
                <div className="mb-10 space-y-4">
                    <h1 className="text-[32px] font-extrabold text-gray-900 leading-[1.2] tracking-tight">
                        무의식은<br />
                        <span className="relative inline-block">
                            <span className="relative z-10 text-gray-900">답을 알고 있습니다</span>
                            <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-100 -z-0 -rotate-1"></span>
                        </span>
                    </h1>
                    <p className="text-gray-500 text-[14px] leading-relaxed">
                        0.1초의 반응 속도와 투사적 이미지는<br />
                        거짓말을 하지 못합니다.
                    </p>
                </div>

                {/* Structured Process Flow - Centered Column Layout */}
                <div className="w-full max-w-xs relative flex flex-col gap-4 items-center">

                    {/* Vertical Connecting Line */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gray-100 -translate-x-1/2 z-0"></div>

                    {/* Item 1 */}
                    <div className="relative z-10 bg-white w-full p-6 rounded-3xl border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-4 hover:border-gray-200 transition-all">
                        <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center p-3 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icon_discovery.png" alt="Discovery" className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-[16px] mb-2">숨겨진 욕망 발견</h3>
                            <p className="text-[12px] text-gray-500 leading-relaxed break-keep">
                                나도 몰랐던 내면의 진짜 목소리를<br />정밀하게 포착합니다.
                            </p>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative z-10 bg-white w-full p-6 rounded-3xl border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-4 hover:border-gray-200 transition-all">
                        <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center p-3 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icon_pattern.png" alt="Pattern" className="w-full h-full object-contain opacity-80" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-[16px] mb-2">행동 패턴 이해</h3>
                            <p className="text-[12px] text-gray-500 leading-relaxed break-keep">
                                반복되는 선택의 원인을<br />데이터로 분석합니다.
                            </p>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative z-10 bg-gray-900 w-full p-6 rounded-3xl border border-gray-900 shadow-xl shadow-gray-900/20 flex flex-col items-center text-center gap-4 transform scale-105">
                        <div className="w-16 h-16 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center p-3 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icon_change.png" alt="Change" className="w-full h-full object-contain invert" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-[16px] mb-2">진정한 변화</h3>
                            <p className="text-[12px] text-gray-400 leading-relaxed break-keep">
                                무의식을 의식화할 때<br />비로소 운명은 바뀝니다.
                            </p>
                        </div>
                    </div>

                </div>

            </main>

            {/* Bottom Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] to-transparent z-40 flex justify-center">
                <button
                    onClick={onComplete}
                    className="w-full max-w-xs h-16 bg-black text-white rounded-[24px] font-bold text-[16px] shadow-2xl shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-between px-8 group"
                >
                    <span className="flex flex-col items-start leading-none gap-1.5">
                        <span className="text-[10px] text-white/50 tracking-wider font-medium group-hover:text-white/70 transition-colors">START JOURNEY</span>
                        <span>내 무의식 확인하기</span>
                    </span>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
}
