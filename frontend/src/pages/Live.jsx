import React, { useState } from 'react';
import CameraView from '@/components/camera/CameraView';
import { MOCK_INGREDIENTS } from '@/constants/mockData';
import { Volume2, X } from 'lucide-react';

export default function Live() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleCapture = () => {
        setAnalyzing(true);
        // Simulate API call
        setTimeout(() => {
            setAnalyzing(false);
            // Randomly pick an ingredient for demo
            const randomIngredient = MOCK_INGREDIENTS[Math.floor(Math.random() * MOCK_INGREDIENTS.length)];
            setResult(randomIngredient);
            speakResult(randomIngredient);
        }, 1500);
    };

    const speakResult = (ingredient) => {
        const text = `${ingredient.name}. ${ingredient.description}`;
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to set voice to EN-IN if available, else default
        const voices = window.speechSynthesis.getVoices();
        const enInVoice = voices.find(v => v.lang === 'en-IN');
        if (enInVoice) utterance.voice = enInVoice;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 bg-gray-50 dark:bg-gray-950">

            {/* Camera Area */}
            <div className="flex-1 relative">
                <CameraView onCapture={handleCapture} />

                {/* Analyzing Overlay */}
                {analyzing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl z-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white font-medium text-lg">Analyzing...</p>
                        </div>
                    </div>
                )}

                {/* Result Card */}
                {result && !analyzing && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl z-30 animate-in slide-in-from-bottom-10 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{result.name}</h2>
                            <button onClick={() => setResult(null)} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 
                    ${result.safety_level === 'Code Green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                result.safety_level === 'Code Red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {result.safety_level}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
                            {result.description}
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={() => speakResult(result)}
                                className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:underline"
                            >
                                <Volume2 size={20} /> Listen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
