'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StoryTextProps {
    text: string;
    className?: string;
    speed?: number;
    delay?: number;
    once?: boolean;
}

export default function StoryText({ text, className = "", speed = 0.05, delay = 0, once = true }: StoryTextProps) {
    // Split text by words, spaces, and common tags
    const parts = text.split(/(<span.*?>.*?<\/span>|<b.*?>.*?<\/b>|<br\s*\/?>|\s+)/g);

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: speed, delayChildren: delay * i },
        }),
    };

    const child: any = {
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px) saturate(1)',
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 120,
            },
        },
        hidden: {
            opacity: 0,
            y: 12,
            scale: 1.1,
            filter: 'blur(15px) saturate(0)',
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 120,
            },
        },
    };

    return (
        <motion.div
            style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center' }}
            variants={container}
            initial="hidden"
            whileInView={once ? "visible" : undefined}
            animate={!once ? "visible" : undefined}
            className={`font-serif-kr ${className}`}
        >
            {parts.map((part, index) => {
                if (!part) return null;
                if (part === ' ' || part === '\n') return <span key={index}>&nbsp;</span>;
                if (part.match(/<br\s*\/?>/i)) return <div key={index} className="w-full h-0" />;

                // Handle span tags
                const spanMatch = part.match(/<span\s+class=['"](.*?)['"]>(.*?)<\/span>/i);
                if (spanMatch) {
                    const [_, className, innerText] = spanMatch;
                    return (
                        <motion.span
                            variants={child}
                            key={index}
                            className={`inline-block ${className}`}
                        >
                            {innerText}
                        </motion.span>
                    );
                }

                // Handle bold tags
                const boldMatch = part.match(/<b.*?>(.*?)<\/b>/i);
                if (boldMatch) {
                    const [_, innerText] = boldMatch;
                    return (
                        <motion.span
                            variants={child}
                            key={index}
                            className="inline-block font-bold text-white/90"
                        >
                            {innerText}
                        </motion.span>
                    );
                }

                return (
                    <motion.span
                        variants={child}
                        key={index}
                        className="inline-block"
                    >
                        {part}
                    </motion.span>
                );
            })}
        </motion.div>
    );
}
