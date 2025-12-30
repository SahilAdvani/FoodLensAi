import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '@/store/chatSlice';
import CameraView from '@/components/camera/CameraView';
import VoiceVisualizer from '@/components/live/VoiceVisualizer';
import { MOCK_INGREDIENTS, LIVE_MODE_CONSTANTS } from '@/constants/mockData';
import { Volume2, X, RefreshCw } from 'lucide-react';

const STEPS = {
    GREETING: 'greeting',
    CAMERA_PERMISSION: 'camera_permission',
    STEADY_INSTRUCTION: 'steady_instruction',
    SCANNING: 'scanning',
    ANALYZING: 'analyzing',
    RESULT: 'result'
};

export default function Live() {
    const dispatch = useDispatch();
    const { currentLanguage } = useSelector((state) => state.language);

    // States
    const [step, setStep] = useState(STEPS.GREETING);
    const [result, setResult] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'bot-speaking' | 'user-speaking'

    const texts = LIVE_MODE_CONSTANTS[currentLanguage] || LIVE_MODE_CONSTANTS['en-IN'];

    // Speak utility with Chat Sync & Visualizer State
    const speak = (text, onEnd) => {
        // Sync to Chat
        dispatch(addMessage({ role: 'ai', content: text }));

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const preferredLang = currentLanguage === 'hi-IN' ? 'hi-IN' : 'en-IN';
        const voice = voices.find(v => v.lang.includes(preferredLang)) || voices[0];
        if (voice) utterance.voice = voice;
        utterance.rate = 0.9;

        utterance.onstart = () => setVoiceState('bot-speaking');
        utterance.onend = () => {
            setVoiceState('idle');
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    };

    // Step 1: Greeting on Mount
    useEffect(() => {
        // Small delay to ensure voices are loaded (browser quirk)
        const timer = setTimeout(() => {
            speak(texts.greeting, () => {
                setStep(STEPS.CAMERA_PERMISSION);
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [currentLanguage]);

    // Step 2: Camera Permission Instruction
    useEffect(() => {
        if (step === STEPS.CAMERA_PERMISSION) {
            speak(texts.turnOnCamera, () => {
                setCameraActive(true); // Trigger Camera View mount
            });
        }
    }, [step]);

    // Callback when camera is successfully active (from CameraView)
    const handleCameraReady = () => {
        setStep(STEPS.STEADY_INSTRUCTION);
    };

    // Step 3: Steady Instruction -> Auto Scanning
    useEffect(() => {
        if (step === STEPS.STEADY_INSTRUCTION) {
            speak(texts.keepSteady, () => {
                setStep(STEPS.SCANNING);
            });
        }
    }, [step]);

    // Step 4: Scanning
    useEffect(() => {
        if (step === STEPS.SCANNING) {
            // Simulate "Listening/Waiting" state (User Speaking Visuals)
            setVoiceState('user-speaking'); // Visualizer shrinks as requested "while user speaking" (simulated here as user is "active")

            const timer = setTimeout(() => {
                setVoiceState('idle');
                setStep(STEPS.ANALYZING);
                handleCapture();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);


    const handleCapture = () => {
        setTimeout(() => {
            const randomIngredient = MOCK_INGREDIENTS[Math.floor(Math.random() * MOCK_INGREDIENTS.length)];
            setResult(randomIngredient);
            setStep(STEPS.RESULT);

            const desc = currentLanguage === 'hi-IN' ? randomIngredient.description : randomIngredient.description;
            const text = `${texts.resultPrefix} ${randomIngredient.name}. ${desc}`;

            speakResult(text); // Speak result
        }, 2000);
    };

    const speakResult = (text) => {
        speak(text);
    };

    const resetFlow = () => {
        setResult(null);
        setStep(STEPS.STEADY_INSTRUCTION); // Go back to steady -> scan
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 bg-gray-50 dark:bg-gray-950">

            {/* Camera Area */}
            <div className={`flex-1 relative rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 
                ${step === STEPS.RESULT ? 'h-1/2' : 'h-full'}`}>
                {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                        <p className="animate-pulse">Waiting for camera instructions...</p>
                    </div>
                )}

                {cameraActive && (
                    <CameraView
                        onCapture={handleCapture}
                        onReady={handleCameraReady} // You need to add this prop to CameraView!
                    />
                )}

                {/* Overlays based on Step */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">

                    {step === STEPS.SCANNING && (
                        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white font-medium animate-pulse border border-white/20">
                            Keep Steady...
                        </div>
                    )}

                    {step === STEPS.ANALYZING && (
                        <div className="flex flex-col items-center gap-4 bg-black/60 p-8 rounded-3xl backdrop-blur-md">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white font-medium text-xl">{texts.analyzing}</p>
                        </div>
                    )}
                </div>

                {/* Result Card */}
                {result && step === STEPS.RESULT && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-6 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-30 animate-in slide-in-from-bottom-full duration-500 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{result.name}</h2>
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                    ${result.safety_level === 'Code Green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        result.safety_level === 'Code Red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {result.safety_level}
                                </div>
                            </div>
                            <button onClick={resetFlow} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors pointer-events-auto">
                                <RefreshCw size={24} />
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                            {result.description}
                        </p>

                        <div className="flex justify-end gap-4 pointer-events-auto">
                            <button
                                onClick={() => speakResult(result)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Volume2 size={20} /> Replay
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
