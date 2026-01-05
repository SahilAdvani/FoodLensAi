import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { useTranslation } from 'react-i18next';

export default function LiveGreeting({ step, voiceState, onSkip }) {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-40">
            {/* Visualizer */}
            <div className="mb-8">
                <VoiceVisualizer state={voiceState === 'idle' ? 'idle' : voiceState} />
            </div>

            {/* Status Text */}
            <p className="text-gray-300 font-medium text-lg mb-12 animate-pulse text-center max-w-xs">
                {step === 'greeting' ? t('live.greeting') : t('live.turnOnCamera')}
            </p>

            {/* Quick Action: Skip to Camera */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSkip}
                className="flex flex-col items-center gap-2 group pointer-events-auto"
            >
                <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors">
                    <RefreshCw size={32} className="text-white" />
                </div>
                <span className="text-white/60 text-sm font-medium">Table Scan</span>
            </motion.button>
        </div>
    );
}
