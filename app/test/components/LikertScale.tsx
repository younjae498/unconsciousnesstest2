'use client';

import { } from 'react';

interface LikertScaleProps {
    value: number;
    onChange: (value: number) => void;
    leftLabel?: string;
    rightLabel?: string;
    min?: number;
    max?: number;
}

export default function LikertScale({ value, onChange, min = 1, max = 5, leftLabel = "전혀 아니다", rightLabel = "매우 그렇다" }: LikertScaleProps) {
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex justify-center items-center relative h-14 w-full max-w-xs mx-auto gap-4">
                {/* Background Line - constrained to the grouping */}
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 z-0 rounded-full"></div>

                {range.map((num) => {
                    const isSelected = value === num;
                    const isLower = value !== 0 && num < value;

                    return (
                        <button
                            key={num}
                            onClick={() => onChange(num)}
                            className="relative z-10 group focus:outline-none flex-1 flex justify-center"
                        >
                            <div
                                className={`flex items-center justify-center rounded-full border transition-all duration-500 ease-out
                                  ${isSelected
                                        ? 'w-14 h-14 bg-black border-black shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] scale-110 z-20'
                                        : 'w-11 h-11 bg-white border-gray-200 hover:border-gray-400 hover:scale-105 shadow-sm'
                                    }
                                  ${isLower ? 'border-gray-900/40 bg-gray-50' : ''}
                                `}
                            >
                                <span className={`text-[15px] font-black transition-all duration-300 ${isSelected ? 'text-white' : 'text-gray-900/60 group-hover:text-gray-900'}`}>
                                    {num}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between w-full max-w-xs mt-2 text-[10px] text-gray-400 font-bold px-2">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
        </div>
    );
}
