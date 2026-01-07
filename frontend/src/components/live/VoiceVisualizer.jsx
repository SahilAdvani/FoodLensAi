import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceVisualizer({ state }) {


    const variants = {
        idle: {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            borderRadius: ["50%", "45%", "50%"],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        'bot-speaking': {
            scale: [1, 1.3, 1.1, 1.4, 1], // Elongate/Expand
            scaleY: [1, 0.8, 1.2, 0.9, 1], // Stretch
            filter: ["blur(0px)", "blur(4px)", "blur(0px)"],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        'user-speaking': {
            scale: [0.9, 0.8, 0.85, 0.8], // Shrink/Pulse
            transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: "backOut"
            }
        }
    };

    const gradientColors = {
        idle: "from-slate-400/60 to-gray-600/60",
        'bot-speaking': "from-cyan-400/80 to-blue-600/80",
        'user-speaking': "from-emerald-400/80 to-green-600/80"
    };

    return (
        <div className="flex items-center justify-center p-8">
            <motion.div
                className={`w-32 h-32 bg-gradient-to-br ${gradientColors[state] || gradientColors.idle} backdrop-blur-xl rounded-full shadow-2xl border border-white/20`}
                variants={variants}
                animate={state}
                initial="idle"
            />
        </div>
    );
}
