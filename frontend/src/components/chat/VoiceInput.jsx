import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { transcribeAudio } from '@/services/api';

const VoiceInput = forwardRef(({ onTranscript, lang = 'en-US', onStateChange }, ref) => {
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useImperativeHandle(ref, () => ({
        start: () => {
            startRecording();
        },
        stop: () => {
            stopRecording();
        }
    }));

    useEffect(() => {
        if (onStateChange) onStateChange(isListening);
    }, [isListening, onStateChange]);

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Choose supported MIME type (webm is standard, mp4/wav as fallbacks)
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'audio/mp4' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = {}; // browser default
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all audio tracks to release microphone
                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
                if (audioBlob.size === 0) return;

                setIsLoading(true);
                try {
                    const result = await transcribeAudio(audioBlob);
                    if (result && result.text) {
                        onTranscript(result.text);
                    }
                } catch (err) {
                    console.error("Transcription failed", err);
                } finally {
                    setIsLoading(false);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (err) {
            console.error("Microphone access denied or failed:", err);
            setIsListening(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${isListening
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg'
                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                } disabled:opacity-50`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
        >
            {isLoading ? (
                <Loader2 className="animate-spin text-green-600 dark:text-green-400" size={18} />
            ) : isListening ? (
                <MicOff size={18} />
            ) : (
                <Mic size={18} />
            )}
        </button>
    );
});

export default VoiceInput;
