import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addMessage } from '@/store/chatSlice';
import {
    createSession,
    analyzeImage,
    sendMessage,
    textToSpeech,
} from '@/services/api';
import { supabase } from '@/supabase/client';

export const STEPS = {
    GREETING: 'greeting',
    CAMERA_PERMISSION: 'camera_permission',
    STEADY_INSTRUCTION: 'steady_instruction',
    SCANNING: 'scanning',
    REVIEW: 'review',
    ANALYZING: 'analyzing',
    RESULT: 'result',
};

export function useLiveMode() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentLanguage } = useSelector(
        s => s.language,
        shallowEqual
    );

    /* ---------------- state ---------------- */

    const [step, setStep] = useState(STEPS.GREETING);
    const [result, setResult] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [voiceState, setVoiceState] = useState('idle');
    const [sessionId, setSessionId] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [isResponding, setIsResponding] = useState(false);
    const [needsUserStart, setNeedsUserStart] = useState(true);

    /* ---------------- refs ---------------- */

    const stepRef = useRef(step);
    const voiceInputRef = useRef(null);
    const audioRef = useRef(null);
    const audioUnlockedRef = useRef(false);
    const greetingSpokenRef = useRef(false);
    const latestSpeakId = useRef(0);

    /* ---------------- helpers ---------------- */

    const stopAudio = () => {
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            if (audioRef.current.src) {
                URL.revokeObjectURL(audioRef.current.src);
            }
            audioRef.current = null;
        }
    };

    // Cleanup on unmount (navigation)
    useEffect(() => {
        return () => stopAudio();
    }, []);

    // Keep stepRef in sync with step state
    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    /* ===================== SPEAK (MUST BE FIRST) ===================== */

    const speak = useCallback(
        async (rawText, onEnd) => {
            if (!audioUnlockedRef.current) return false;

            const myId = ++latestSpeakId.current;

            // Clean markdown for TTS
            const text = rawText.replace(/[#*`_\[\]]/g, '');

            stopAudio();
            setVoiceState('bot-speaking');
            dispatch(addMessage({ role: 'ai', content: text }));

            const finalize = () => {
                if (latestSpeakId.current === myId) {
                    setVoiceState('idle');
                    onEnd?.();

                    // Auto-open Mic in Result Mode
                    if (stepRef.current === STEPS.RESULT && voiceInputRef.current) {
                        // Small delay to ensure audio context is clear
                        setTimeout(() => {
                            if (voiceInputRef.current) {
                                try {
                                    voiceInputRef.current.start();
                                } catch (e) {
                                    console.error("Failed to start voice input:", e);
                                }
                            }
                        }, 300);
                    }
                }
            };

            try {
                const voiceId =
                    currentLanguage === 'hi-IN'
                        ? 'broqrJkktxd1CclKTudW'
                        : '21m00Tcm4TlvDq8ikWAM';

                const blob = await textToSpeech(text, voiceId);

                if (latestSpeakId.current !== myId) return false;

                const audio = new Audio(URL.createObjectURL(blob));

                audioRef.current = audio;
                audio.onended = finalize;
                audio.onerror = finalize;

                await audio.play();
                return true;
            } catch (e) {
                console.warn("TTS API failed, falling back:", e);
                if (latestSpeakId.current !== myId) return false;

                const utter = new SpeechSynthesisUtterance(text);
                utter.lang =
                    currentLanguage === 'hi-IN' ? 'hi-IN' : 'en-US';
                utter.onend = finalize;
                window.speechSynthesis.speak(utter);
                return true;
            }
        },
        [currentLanguage, dispatch]
    );

    /* ===================== START LIVE (AUDIO UNLOCK) ===================== */

    const startLive = useCallback(() => {
        // 1. Unlock audio
        const a = new Audio();
        a.src =
            'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA';
        a.play().catch(() => { });

        audioUnlockedRef.current = true;
        setNeedsUserStart(false);

        // 2. Speak greeting ONCE
        if (step === STEPS.GREETING && !greetingSpokenRef.current) {
            greetingSpokenRef.current = true;
            speak(t('live.greeting'), () => {
                setTimeout(() => {
                    setStep(STEPS.CAMERA_PERMISSION);
                }, 2500); // 2.5s delay
            });
        }
    }, [step, speak, t]);


    useEffect(() => {
        if (step !== STEPS.GREETING) return;
        if (needsUserStart) return;
        if (greetingSpokenRef.current) return;

        greetingSpokenRef.current = true;
        speak(t('live.greeting'), () => {
            setTimeout(() => {
                setStep(STEPS.CAMERA_PERMISSION);
            }, 2500); // 2.5s delay
        });
    }, [step, needsUserStart, speak, t]);

    /* ---------------- handlers ---------------- */

    const handleInitSession = useCallback(async userId => {
        if (sessionId) return;
        const id = await createSession('live', userId);
        setSessionId(id);
    }, [sessionId]);

    const handleCameraPermission = useCallback(() => {
        if (step !== STEPS.CAMERA_PERMISSION) return;
        speak(t('live.turnOnCamera'), () =>
            setTimeout(() => setCameraActive(true), 500) // 0.5s buffer
        );
    }, [step, speak, t]);

    const handleCameraReady = useCallback(() => {
        setTimeout(() => {
            // Guard: Only transition to STEADY if still in PERMISSION
            setStep(prev =>
                prev === STEPS.CAMERA_PERMISSION ? STEPS.STEADY_INSTRUCTION : prev
            );
        }, 500); // Reduced to 500ms
    }, []);

    const handleSteady = useCallback(() => {
        if (step !== STEPS.STEADY_INSTRUCTION) return;
        speak(t('live.keepSteady'), () =>
            setStep(STEPS.SCANNING)
        );
    }, [step, speak, t]);

    const handleCapture = useCallback(src => {
        stopAudio(); // Stop "Keep Steady" immediately
        setCapturedImage(src);
        setStep(STEPS.REVIEW);
    }, []);

    const handleRetake = useCallback(() => {
        stopAudio();
        setResult(null);
        setCapturedImage(null);
        setCameraActive(true);
        setStep(STEPS.SCANNING);
    }, []);

    /* ---------------- realtime ---------------- */

    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase
            .channel(`session-${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `session_id=eq.${sessionId}`,
                },
                payload => {
                    if (payload.new.source === 'analysis_result') {
                        setResult({ description: payload.new.content });
                        setStep(STEPS.RESULT);
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [sessionId]);

    /* ---------------- api ---------------- */

    const handleConfirm = useCallback(
        async userId => {
            if (step === STEPS.ANALYZING) return; // Prevent double submission

            try {
                setStep(STEPS.ANALYZING);
                setConversation([]);

                const sid =
                    sessionId || (await createSession('live', userId));
                setSessionId(sid);

                const img = new Image();
                img.src =
                    typeof capturedImage === 'string'
                        ? capturedImage
                        : URL.createObjectURL(capturedImage);

                await img.decode();

                const canvas = document.createElement('canvas');
                const scale = Math.min(1, 1000 / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const blob = await new Promise(r =>
                    canvas.toBlob(r, 'image/jpeg', 0.8)
                );

                const res = await analyzeImage(
                    blob,
                    sid,
                    userId,
                    currentLanguage
                );

                setResult({ description: res?.data?.analysis });
                setStep(STEPS.RESULT);
                speak(res?.data?.speech || res?.data?.analysis);
            } catch (e) {
                console.error(e);
                speak(
                    currentLanguage === 'hi-IN'
                        ? 'फोटो साफ़ नहीं दिख रही। कृपया दूसरी अच्छी फोटो डालें।'
                        : 'Error analyzing. Please try again with a clear image.'
                );

                setCameraActive(true);
                setCapturedImage(null);
                setStep(STEPS.SCANNING);
            }
        },
        [sessionId, capturedImage, currentLanguage, speak, step]
    );

    const handleVoiceQuery = useCallback(
        async (text, userId) => {
            if (!text || !sessionId) return;

            // stop any bot speech if user interrupts
            window.speechSynthesis.cancel();

            // polite exit phrases
            const lower = text.toLowerCase();
            if (
                ['thank', 'thanks', 'bye', 'dhanyavad', 'shukriya', 'bas'].some(w =>
                    lower.includes(w)
                )
            ) {
                speak(
                    currentLanguage === 'hi-IN'
                        ? 'FoodLens AI का उपयोग करने के लिए धन्यवाद।'
                        : 'Thank you for using FoodLens AI.',
                    () => setShowExitModal(true)
                );
                return;
            }

            setIsResponding(true);

            // optimistic UI: add question
            setConversation(prev => [
                ...prev,
                { question: text, answer: null },
            ]);

            try {
                const res = await sendMessage(sessionId, text, userId);

                setConversation(prev => {
                    const next = [...prev];
                    next[next.length - 1].answer = res.content;
                    return next;
                });

                speak(res.content);
            } catch (err) {
                console.error(err);

                setConversation(prev => prev.slice(0, -1));
                speak(
                    currentLanguage === 'hi-IN'
                        ? 'नेटवर्क त्रुटि हुई।'
                        : 'Network error. Please try again.'
                );
            } finally {
                setIsResponding(false);
            }
        },
        [sessionId, currentLanguage, speak]
    );

    return {
        step,
        setStep,
        needsUserStart,
        startLive,

        result,
        cameraActive,
        setCameraActive,
        voiceState,
        sessionId,
        capturedImage,
        showQR,
        setShowQR,
        showExitModal,
        setShowExitModal,
        conversation,
        isResponding,
        voiceInputRef,

        stopAudio,
        speak,
        handleInitSession,
        handleCameraPermission,
        handleCameraReady,
        handleSteady,
        handleCapture,
        handleRetake,
        handleConfirm,
        handleVoiceQuery
    };
}
