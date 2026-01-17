'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryText from '@/components/StoryText';
import { useTestStore } from '@/store/testStore';
import { StageRef } from '../types';

interface IntroStageProps {
    onComplete: () => void;
}

const IntroStage = forwardRef<StageRef, IntroStageProps>(({ onComplete }, ref) => {
    const [page, setPage] = useState<1 | 2 | 3 | 4>(1);

    useImperativeHandle(ref, () => ({
        goBack: () => {
            if (page > 1) {
                setPage(prev => (prev - 1) as 1 | 2 | 3 | 4);
                return true;
            }
            return false;
        }
    }));

    const renderPage1 = () => (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative z-30">
            <header className="mb-[4vh] flex flex-col items-center gap-2">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[0.6em] text-white uppercase italic mb-2"
                >
                    제1장 : 사랑을 몰랐던 신수와 재의 마을
                </motion.span>
                <div className="w-16 h-[1px] bg-white opacity-20 mb-4"></div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                >
                    하나. [Page 1: 태초의 빛]
                </motion.span>
            </header>

            <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                <StoryText
                    text="&quot;태초의 영겁 속, 세상은 하나의 거대한 화폭이었고 그 중심에는 만물에 생동의 파동을 수혈하던 영물, <span class='text-white/90 font-black'>'신수(神獸)'</span>가 살았습니다. 그는 고귀한 도자기처럼 차가웠으나 누구보다 아름다웠습니다. 자신의 살점을 허물어 꽃들에게 타오르는 선혈의 향기를 점지했고, 투명한 눈물을 쏟아 바다에게 끝을 알 수 없는 청취(聽翠)의 심연을 선사했습니다.&quot;"
                    speed={0.06}
                    className="text-[var(--fluid-h2)] font-display font-black text-white/70 leading-relaxed italic drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] px-4"
                />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setPage(2)}
                className="mt-[8vh] group flex flex-col items-center gap-2 outline-none hover:opacity-80 transition-opacity"
            >
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                <span className="text-white font-display font-black text-xl italic tracking-widest">다음 페이지</span>
            </motion.button>
        </div>
    );

    const renderPage2 = () => (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative z-30">
            <header className="mb-[4vh] flex flex-col items-center gap-2">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[0.6em] text-white uppercase italic mb-2"
                >
                    제1장 : 사랑을 몰랐던 신수와 재의 마을
                </motion.span>
                <div className="w-16 h-[1px] bg-white opacity-20 mb-4"></div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                >
                    둘. [Page 2: 탐욕의 시작]
                </motion.span>
            </header>

            <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                <StoryText
                    text="&quot;숲의 언저리, 마을은 언제나 눈부셨습니다. 그가 몸을 뒤척이면 들판에는 황금빛 밀물이 파도쳤고, 포효하면 시냇물은 에메랄드빛 유리 조각처럼 흘러갔습니다. 하지만 오랜 풍요는 감사를 무뎌지게 했습니다. 사람들은 이제 신수가 주는 향기를 사랑하는 대신, 그 향기를 병에 담아 홀로 소유하고 싶어 했습니다. 마음으로 느껴야 할 축복을 손에 잡히는 전리품으로 여기기 시작한 것입니다.&quot;"
                    speed={0.06}
                    className="text-[var(--fluid-h2)] font-display font-black text-white/70 leading-relaxed italic drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] px-4"
                />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setPage(3)}
                className="mt-[8vh] group flex flex-col items-center gap-2 outline-none hover:opacity-80 transition-opacity"
            >
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                <span className="text-white font-display font-black text-xl italic tracking-widest">다음 페이지</span>
            </motion.button>
        </div>
    );

    const renderPage3 = () => (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative z-30">
            <header className="mb-[4vh] flex flex-col items-center gap-2">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[0.6em] text-white uppercase italic mb-2"
                >
                    제1장 : 사랑을 몰랐던 신수와 재의 마을
                </motion.span>
                <div className="w-16 h-[1px] bg-white opacity-20 mb-4"></div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                >
                    셋. [Page 3: 비극의 서막]
                </motion.span>
            </header>

            <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                <StoryText
                    text="&quot;어째서 매일 저 신수의 자비만을 기다려야 하지? 우리가 그 빛을 '소유'한다면, 언제든 꺼내 볼 수 있을 텐데! 정말 중요한 것은 눈에 보이지 않는다는 사실을 잊은 사람들은, 신수를 책임지는 대신 조각내어 차지하길 원했습니다. 그들은 차가운 칼날로 신수의 흉벽을 허물어 색채의 기원을 도려냈고, 별을 담고 있던 그의 두 눈마저 약탈했습니다. 비명이 터진 자리엔 선혈 대신 하얀 재만이 눈처럼 쓸쓸히 흩날렸습니다.&quot;"
                    speed={0.06}
                    className="text-[var(--fluid-h2)] font-display font-black text-white/70 leading-relaxed italic drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] px-4"
                />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setPage(4)}
                className="mt-[8vh] group flex flex-col items-center gap-2 outline-none hover:opacity-80 transition-opacity"
            >
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                <span className="text-white font-display font-black text-xl italic tracking-widest">다음 페이지</span>
            </motion.button>
        </div>
    );

    const renderPage4 = () => (
        <div className="w-full flex-1 flex flex-col items-center justify-center relative z-30">
            <header className="mb-[4vh] flex flex-col items-center gap-2">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[0.6em] text-white uppercase italic mb-2"
                >
                    제1장 : 사랑을 몰랐던 신수와 재의 마을
                </motion.span>
                <div className="w-16 h-[1px] bg-white opacity-20 mb-4"></div>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="text-[var(--fluid-caption)] font-display font-black tracking-[1.2em] text-white uppercase italic"
                >
                    넷. [Page 4: 제물의 운명]
                </motion.span>
            </header>

            <div className="space-y-[4vh] max-w-4xl px-8 flex flex-col items-center text-center">
                <StoryText
                    text="&quot;모든 광채를 빼앗긴 존재는 숲의 깊은 유배지로 침잠하여, <span class='text-white/90 font-black'>형체 없는 허공을 더듬는 거대한 ‘백색 괴물’</span>이 되었습니다. 신수를 배신한 마을은 대가로 모든 색을 잃고 잿빛 안개에 갇혔습니다. 공포에 질린 사람들은 괴물의 진노를 달래기 위해, 세상에서 가장 맑은 영혼을 가진 당신을 <span class='text-white/90 font-black'>‘제물’</span>로 선택해 숲의 입구로 떠밀었습니다.&quot;"
                    speed={0.06}
                    className="text-[var(--fluid-h2)] font-display font-black text-white/70 leading-relaxed italic drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] px-4"
                />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => {
                    useTestStore.getState().setVisualStage(2);
                    onComplete();
                }}
                className="mt-[8vh] group flex flex-col items-center gap-2 outline-none hover:opacity-80 transition-opacity"
            >
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700" />
                <span className="text-white font-display font-black text-xl italic tracking-widest">숲으로 향하기</span>
            </motion.button>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col font-body text-stone-200 relative text-center overflow-hidden px-[5vw] py-[5vh]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={page}
                    initial={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(30px)' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full h-full flex flex-col"
                >
                    {page === 1 && renderPage1()}
                    {page === 2 && renderPage2()}
                    {page === 3 && renderPage3()}
                    {page === 4 && renderPage4()}
                </motion.div>
            </AnimatePresence>

            {/* Subtle Gradient Backdrops unique to Intro */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-stone-900/50 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-black to-transparent opacity-60"></div>
            </div>
        </div>
    );
});

export default IntroStage;
