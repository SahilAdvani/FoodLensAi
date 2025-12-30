import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, lang = 'en-US' }) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = lang;

            rec.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
                setIsListening(false);
            };

            rec.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    }, [lang, onTranscript]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    if (!recognition) return null;

    return (
        <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all duration-300 ${isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg'
                    : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                }`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
        >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
    );
}
