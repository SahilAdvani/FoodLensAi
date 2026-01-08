
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Camera } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { useTranslation } from 'react-i18next';

function LiveGreeting({ step, voiceState, onSkip }) {
    const { t } = useTranslation();

    const isCameraStep = step === 'camera_permission';
    const isSteadyStep = step === 'steady_instruction';

    let message = t('live.greeting');
    if (isCameraStep) message = t('live.turnOnCamera');
    if (isSteadyStep) message = t('live.keepSteady');


    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8">
                <VoiceVisualizer state={voiceState} />
            </div>

            <p className="text-gray-300 font-medium text-lg mb-12 animate-pulse text-center max-w-xs">
                {message}
            </p>


            {!isSteadyStep && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSkip}
                    className="flex flex-col items-center gap-2 pointer-events-auto"
                >
                    <div
                        className={`p-4 rounded-full bg-white/10 border backdrop-blur-md transition-colors
              ${isCameraStep
                                ? 'border-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                : 'border-white/10 hover:bg-white/20'
                            }`}
                    >
                        {isCameraStep ? (
                            <Camera size={32} className="text-white" />
                        ) : (
                            <RefreshCw size={32} className="text-white" />
                        )}
                    </div>

                    <span className="text-white/60 text-sm font-medium">
                        {isCameraStep ? t('live.startCamera') : 'Table Scan'}
                    </span>
                </motion.button>
            )}
        </div >
    );
}

export default React.memo(LiveGreeting);
