'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTestStore } from '@/store/testStore';
import StoryText from '@/components/StoryText';

import { PaimaScores } from '@/lib/scoring';

interface ResultStageProps {
    scores: PaimaScores;
    profile: string;
}

export default function ResultStage({ scores, profile }: ResultStageProps) {
    const router = useRouter();

    useEffect(() => {
        // Set visual stage for Epilogue
        useTestStore.getState().setVisualStage(7);
    }, []);

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center font-body overflow-hidden px-[5vw] py-[5vh]">

            {/* Header Whisper */}
            <header className="text-center mb-[5vh] relative z-10 shrink-0 h-[8vh] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="flex flex-col items-center gap-1"
                >
                    <span className="text-[var(--fluid-caption)] font-display font-black tracking-[1em] text-white uppercase italic">[제3장 : 기적 같은 여행의 종착지, 당신의 얼굴]</span>
                </motion.div>
            </header>

            <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
                <div className="w-full max-w-4xl space-y-[6vh] text-center">

                    {/* The Reawakened Guardian Message - Final Revelation */}
                    <div className="space-y-[3vh]">
                        <StoryText
                            text="당신이 마지막 문장을 완성하는 순간, <br/> 신수는 비로소 눈을 뜨고 당신을 직시합니다."
                            speed={0.08}
                            className="text-[var(--fluid-h1)] font-display font-black leading-tight text-white italic tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 3, duration: 2 }}
                        >
                            <StoryText
                                text="&quot;그의 피부 아래로는 당신이 나누어준 생명력이 태고의 무지개가 되어 눈부시게 일렁입니다. 당신이 그에게 건넨 것은 단순한 빛이 아니라, 다시 누군가를 믿고 싶다는 절박한 사랑이었습니다. 신수가 다시 뜨는 눈으로 바라보게 된 이 세상의 첫 번째 풍경은, 칠흑 같은 어둠 속에서도 끝까지 자신의 손을 놓지 않았던 당신의 찬란한 얼굴이었습니다.&quot;"
                                speed={0.06}
                                delay={3.5}
                                className="text-[var(--fluid-h2)] leading-relaxed max-w-2xl mx-auto font-body italic tracking-widest text-white/80"
                            />
                        </motion.div>
                    </div>

                    {/* Letter from the Heart - Psychological Archetype */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 6, duration: 2 }}
                        className="relative p-[4vh] bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.1)] mx-auto max-w-2xl"
                    >
                        {/* Decorative Corner */}
                        <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-white/20 rounded-tl-xl" />
                        <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-white/20 rounded-br-xl" />

                        <div className="space-y-[3vh] relative z-10">
                            <h3 className="text-[var(--fluid-caption)] font-display font-black tracking-[0.5em] text-stone-500 uppercase italic">Light_Companion</h3>
                            <div className="text-[var(--fluid-h1)] font-display font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_white]">
                                {profile.includes('INTEGRATED_SAGE') ? '심해의 평온을 품은 현자' :
                                    profile.includes('EXHAUSTED_HERO') ? '폭풍 속을 걷는 불굴의 영웅' :
                                        profile.includes('DORMANT_RULER') ? '운명을 기다리는 고독한 왕' :
                                            profile.includes('OVERLOADED_CAREGIVER') ? '비를 맞으며 숲을 지키는 존재' :
                                                profile.includes('CONFLICTED_LOVER') ? '두 개의 심장을 지닌 여행자' :
                                                    profile.includes('SUPPRESSED_CREATOR') ? '안개에 갇힌 찬란한 예술가' :
                                                        profile.includes('WANDERING_EXPLORER') ? '지도를 잃어버린 새벽의 여행자' : '새로운 세계의 개척자'}
                            </div>
                            <p className="text-[var(--fluid-body)] leading-relaxed text-stone-300 font-body italic tracking-wider px-[2vw]">
                                &quot;드디어 찾았어. 내가 돌아와야 했던 유일한 장소를.&quot; <br /> <br />
                                이제 그는 당신의 이름을 부르며, 당신의 본질이 담긴 새로운 세상의 지도를 선물합니다.<br />
                                당신은 이제 차가운 제단에 바쳐진 제물이 아닙니다.<br />
                                신수의 깨진 눈동자에 다시 세상을 그려 넣고, 멈췄던 심장을 다시 뛰게 한 <span className="text-white font-black">{'아름다운 신화의 완성자'}</span>이자,<br />
                                <span className="text-white font-black">{'그가 평생을 기다려온 단 하나의 빛'}</span>입니다.
                            </p>

                            {/* Minimal Radar/Points Visualization - Narrative style */}
                            <div className="flex justify-center gap-[4vw] pt-[2vh]">
                                {[
                                    { label: 'Autonomy', val: scores.Z_N_Auto },
                                    { label: 'Competence', val: scores.Z_N_Comp },
                                    { label: 'Relatedness', val: scores.Z_N_Rela },
                                    { label: 'Wellbeing', val: scores.Z_W_Wellbeing },
                                ].map((item, i) => {
                                    // Map Z-score (-2..+2) to 0..100%
                                    const percent = ((item.val + 2) / 4) * 100;
                                    return (
                                        <div key={item.label} className="flex flex-col items-center gap-2">
                                            <div className="w-1.5 h-[10vh] bg-white/5 relative overflow-hidden rounded-full">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(0, Math.min(100, percent))}%` }}
                                                    transition={{ delay: 8 + (i * 0.2), duration: 2 }}
                                                    className="absolute bottom-0 w-full bg-gradient-to-t from-white/40 to-white shadow-[0_0_15px_white]"
                                                />
                                            </div>
                                            <span className="text-[var(--fluid-caption)] font-display text-[0.6rem] tracking-widest text-stone-600 uppercase italic">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Immersive Action Trigger - Lunar Revelation (Return Home) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 11, duration: 2 }}
                className="pb-[5vh] flex justify-center z-30"
            >
                <button
                    onClick={() => router.push('/report')}
                    className="group relative flex flex-col items-center gap-6 outline-none"
                >
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        {/* Lunar Revelation - Waxing Moon */}
                        <motion.div
                            animate={{
                                boxShadow: ['0 0 10px rgba(255,255,255,0.1)', '0 0 30px rgba(255,255,255,0.3)', '0 0 10px rgba(255,255,255,0.1)']
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-white/5 rounded-full blur-2xl"
                        />

                        <div className="relative w-12 h-12 rounded-full border border-white/20 overflow-hidden">
                            {/* Moon Waxing Fill */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ delay: 12, duration: 4, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-white/50 via-white to-white/50 shadow-[0_0_20px_white]"
                            />
                        </div>

                        <div className="absolute w-16 h-16 border border-white/10 rounded-full group-hover:border-white/40 group-hover:scale-110 transition-all duration-1000" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-display font-black tracking-[0.5em] text-white/30 group-hover:text-white transition-all uppercase italic mb-2">MYTH_REBORN</span>
                        <span className="text-white font-display font-black text-2xl italic tracking-tighter drop-shadow-[0_0_15px_white]">다시 눈뜨는 세계, 현실로 돌아가기</span>
                    </div>
                </button>
            </motion.div>
        </div>
    );
}
