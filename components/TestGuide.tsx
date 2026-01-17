import React from 'react';

interface TestGuideProps {
    onStart: () => void;
    onBack: () => void; // Kept in interface for compatibility but unused in UI
}

export default function TestGuide({ onStart }: TestGuideProps) {
    return (
        <div className="min-h-screen paper-texture text-gray-900 font-sans pb-24 flex flex-col overflow-hidden">
            {/* Binding shadow on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-20"></div>

            {/* Header: Credibility Badge */}
            <header className="pt-8 px-6 pb-4 flex justify-between items-center bg-white/30 backdrop-blur-md sticky top-0 z-50 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2c3e50]/40 animate-pulse"></div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#2c3e50]/60 uppercase">PAIMA LAB</span>
                </div>
                <div className="text-[10px] text-[#2c3e50]/40 font-medium italic">v2.4.0 verified</div>
            </header>

            <main className="flex-1 px-6 pt-6 animate-in slide-in-from-right-10 fade-in duration-1000 relative z-10">

                {/* Headline Area */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-[#2c3e50] leading-[1.25] tracking-tight mb-4 font-serif italic">
                        무의식은<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2c3e50] to-[#34495e]">거짓말을 하지 않습니다.</span>
                    </h1>
                    <p className="text-[#2c3e50]/60 text-sm leading-relaxed max-w-sm font-serif">
                        우리가 통제할 수 있는 의식은 빙산의 일각입니다.<br />
                        본 검사는 당신의 <strong>무의식적 반응 속도(IAT)</strong>와 <strong>투사적 이미지 선택</strong>을 분석하여 숨겨진 본성을 포착합니다.
                    </p>
                </div>

                {/* Methodology Infographic Card */}
                <div className="bg-white/90 rounded-sm p-6 mb-8 border border-[#2c3e50]/5 book-page">
                    <div className="flex justify-between items-center mb-6 border-b border-[#2c3e50]/5 pb-4">
                        <h3 className="text-xs font-bold text-[#2c3e50]/70 uppercase tracking-wider font-serif">Analysis Logic</h3>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 rounded-full bg-[#2c3e50]/40"></div>
                            <div className="w-1 h-1 rounded-full bg-[#2c3e50]/10"></div>
                            <div className="w-1 h-1 rounded-full bg-[#2c3e50]/10"></div>
                        </div>
                    </div>

                    {/* Visual Diagram */}
                    <div className="relative h-32 flex items-center justify-center bg-[#f4f1ea] rounded-sm mb-4 overflow-hidden group border border-[#2c3e50]/5">
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full text-[#2c3e50]/10" viewBox="0 0 300 120">
                            <path d="M50 60 L150 60 L250 60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="150" cy="60" r="25" fill="white" fillOpacity="0.5" className="drop-shadow-sm" />
                        </svg>

                        {/* Center Icon */}
                        <div className="relative z-10 w-12 h-12 bg-[#2c3e50] rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        {/* Labels */}
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pt-14 text-[9px] font-bold text-[#2c3e50]/30 text-center uppercase tracking-widest">STIMULI</div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pt-14 text-[9px] font-bold text-[#2c3e50]/70 text-center uppercase tracking-widest">RESPONSE</div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-5 h-5 rounded-full bg-[#2c3e50]/5 flex items-center justify-center mt-0.5 flex-shrink-0 border border-[#2c3e50]/10">
                                <span className="text-[10px] font-bold text-[#2c3e50]/60">1</span>
                            </div>
                            <p className="text-xs text-[#2c3e50]/70 leading-snug font-serif">
                                <span className="font-bold text-[#2c3e50]">투사적 이미지 검사</span>: 모호한 이미지를 통해 내면의 동기를 이끌어냅니다.
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-5 h-5 rounded-full bg-[#2c3e50]/5 flex items-center justify-center mt-0.5 flex-shrink-0 border border-[#2c3e50]/10">
                                <span className="text-[10px] font-bold text-[#2c3e50]/60">2</span>
                            </div>
                            <p className="text-xs text-[#2c3e50]/70 leading-snug font-serif">
                                <span className="font-bold text-[#2c3e50]">반응 시간 측정</span>: 고민할 틈 없는 0.1초의 반응을 정밀 측정합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/60 p-5 rounded-sm border border-[#2c3e50]/5 flex flex-col items-center text-center book-page">
                        <span className="text-2xl font-bold text-[#2c3e50] mb-1 font-serif">11M+</span>
                        <span className="text-[10px] text-[#2c3e50]/40 uppercase tracking-tighter">Data Points</span>
                    </div>
                    <div className="bg-white/60 p-5 rounded-sm border border-[#2c3e50]/5 flex flex-col items-center text-center book-page">
                        <span className="text-2xl font-bold text-[#2c3e50] mb-1 font-serif">92%</span>
                        <span className="text-[10px] text-[#2c3e50]/40 uppercase tracking-tighter">Self-Accuracy</span>
                    </div>
                </div>

                {/* Warning / Notice */}
                <div className="bg-[#2c3e50]/5 rounded-sm p-4 flex gap-4 items-start md:items-center border border-[#2c3e50]/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#2c3e50]/30 mt-0.5 md:mt-0 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] text-[#2c3e50]/50 leading-relaxed font-serif">
                        정확한 분석을 위해 <strong>직관적으로 떠오르는 답</strong>을<br className="hidden md:block" />빠르게 선택해주세요. 오랫동안 고민하면 정확도가 떨어집니다.
                    </p>
                </div>

            </main>

            {/* Bottom Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#f4f1ea] via-[#f4f1ea] to-transparent z-40">
                <button
                    onClick={onStart}
                    className="group relative w-full h-16 bg-[#2c3e50] text-white rounded-sm flex items-center justify-center font-bold text-[16px] shadow-2xl active:scale-[0.98] transition-all overflow-hidden book-page"
                >
                    <span className="relative flex items-center gap-3 font-serif italic">
                        검사 시작하기
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}
