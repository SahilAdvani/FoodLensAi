
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Smartphone, X } from 'lucide-react';

import CameraView from '@/components/camera/CameraView';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { useLiveMode, STEPS } from '@/hooks/useLiveMode';

import LiveGreeting from '@/components/live/LiveGreeting';
import LiveReview from '@/components/live/LiveReview';
import LiveAnalyzing from '@/components/live/LiveAnalyzing';
import LiveResult from '@/components/live/LiveResult';
import TapToStartOverlay from '@/components/live/TapToStartOverlay';

export default function Live() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { currentLanguage } = useSelector(
        s => s.language,
        shallowEqual
    );

    const {
        step,
        setStep,
        needsUserStart,
        startLive,

        result,
        setResult,
        cameraActive,
        setCameraActive,
        voiceState,
        sessionId,
        capturedImage,
        setCapturedImage,
        showQR,
        setShowQR,
        showExitModal,
        conversation,
        voiceInputRef,

        handleInitSession,
        handleCameraPermission,
        handleCameraReady,
        handleSteady,
        handleCapture,
        handleConfirm,
        handleVoiceQuery,
        handleRetake,
        speak,
        stopAudio,
    } = useLiveMode();

    /* ---------------- lifecycle ---------------- */

    useEffect(() => {
        if (user?.id) handleInitSession(user.id);
    }, [user?.id, handleInitSession]);

    useEffect(() => {
        // Prevent accidental back gestures
        const preventBack = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', preventBack);
        return () => window.removeEventListener('popstate', preventBack);
    }, []);

    useEffect(() => {
        if (step === STEPS.CAMERA_PERMISSION) handleCameraPermission();
        if (step === STEPS.STEADY_INSTRUCTION) handleSteady();
    }, [step, handleCameraPermission, handleSteady]);

    /* ---------------- handlers ---------------- */

    const handleReload = useCallback(() => {
        window.location.reload();
    }, []);

    const handleFileUpload = useCallback(
        file => {
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => handleCapture(reader.result);
            reader.readAsDataURL(file);
        },
        [handleCapture]
    );

    const qrValue = useMemo(
        () => `${window.location.origin}/mobile/connect?session=${user?.id}`,
        [user?.id]
    );

    const isGreetingStep =
        step === STEPS.GREETING ||
        step === STEPS.CAMERA_PERMISSION ||
        step === STEPS.STEADY_INSTRUCTION;

    /* ---------------- render ---------------- */

    return (
        <div className="min-h-[calc(100vh-4rem)]  flex flex-col p-4 bg-gray-50 dark:bg-gray-950 relative">
            <SEO
                title="Live Scan"
                description="Real-time food ingredient scanning."
            />

            {/* TAP TO START (CRITICAL) */}
            {needsUserStart && step === STEPS.GREETING && (
                <TapToStartOverlay onStart={startLive} />
            )}

            {/* EXIT MODAL */}
            {showExitModal && (
                <ExitModal
                    onCancel={() => setShowExitModal(false)}
                    onConfirm={handleReload}
                    language={currentLanguage}
                />
            )}

            {/* QR MODAL */}
            {showQR && (
                <QRModal
                    qrValue={qrValue}
                    onClose={() => setShowQR(false)}
                />
            )}

            {/* TOP BAR / CAMERA / CONTENT */}
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-black max-w-lg mx-auto w-full border border-gray-800">

                {/* Close Button */}
                <CloseButton onClick={() => navigate('/')} />

                {/* Mobile Connect Button */}
                {(step === STEPS.GREETING || step === STEPS.SCANNING) && (
                    <ConnectMobile onClick={() => setShowQR(true)} />
                )}

                {/* Greeting / Intro */}
                {(step === STEPS.GREETING || step === STEPS.CAMERA_PERMISSION || step === STEPS.STEADY_INSTRUCTION) && (
                    <div className="absolute inset-0 z-20">
                        <LiveGreeting
                            onSkip={() => {
                                if (step === STEPS.GREETING) {
                                    setStep(STEPS.CAMERA_PERMISSION);
                                } else if (step === STEPS.CAMERA_PERMISSION) {
                                    stopAudio();
                                    setCameraActive(true);
                                }
                            }}
                            language={currentLanguage}
                            voiceState={voiceState}
                            step={step}
                        />
                    </div>
                )}

                {/* Camera View */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${step === STEPS.GREETING ? 'opacity-0' : 'opacity-100'}`}>
                    <CameraView
                        isActive={cameraActive}
                        onReady={handleCameraReady}
                        onCapture={handleCapture}

                        onFileUpload={handleFileUpload}
                        showCaptureButton={step === STEPS.SCANNING || step === STEPS.STEADY_INSTRUCTION}
                        imageSrc={capturedImage}
                        step={step}
                        className="w-full h-full"
                    />
                </div>

                {/* Step Overlays */}
                {step === STEPS.REVIEW && (
                    <LiveReview
                        image={capturedImage}
                        onRetake={handleRetake}
                        onConfirm={() => handleConfirm(user?.id)}
                    />
                )}

                {step === STEPS.ANALYZING && <LiveAnalyzing />}

                {step === STEPS.RESULT && result && (
                    <LiveResult
                        result={result}
                        conversation={conversation}
                        voiceState={voiceState}
                        language={
                            currentLanguage === 'hi-IN' ? 'hi-IN' : 'en-US'
                        }
                        voiceInputRef={voiceInputRef}
                        onReplay={() => speak(result.description)}
                        onStopSpeaking={stopAudio}
                        onVoiceQuery={txt =>
                            handleVoiceQuery(txt, user?.id)
                        }
                        onReset={() => {
                            setResult(null);
                            setCapturedImage(null);
                            handleRetake();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

/* ---------------- memoized helpers ---------------- */

const CloseButton = React.memo(({ onClick }) => (
    <div className="absolute top-4 right-4 z-30">
        <button
            onClick={onClick}
            className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 border border-white/10"
        >
            <X size={24} />
        </button>
    </div>
));

const ConnectMobile = React.memo(({ onClick }) => (
    <div className="absolute top-6 left-6 z-20 hidden md:block">
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm"
        >
            <Smartphone size={16} /> Connect Mobile
        </button>
    </div>
));

const QRModal = ({ qrValue, onClose }) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                Scan to Open on Mobile
            </h3>
            <div className="bg-white p-4 rounded-xl shadow-inner mx-auto max-w-fit">
                <QRCode value={qrValue} size={200} />
            </div>
            <p className="text-center text-gray-500 mt-6 text-sm">
                Point your phone's camera at this QR code to continue on your mobile device.
            </p>
        </div>
    </div>
);

const ExitModal = ({ onCancel, onConfirm, language }) => {
    const navigate = useNavigate();
    const isHindi = language === 'hi-IN';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full sm:w-auto sm:min-w-[320px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-500">
                <div className="text-center mb-6">
                    <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {isHindi ? 'धन्यवाद! 🙏' : 'Thank You! 🙏'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isHindi ? 'आप क्या करना चाहेंगे?' : 'What would you like to do next?'}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isHindi ? 'फिर से स्कैन करें' : 'Start New Scan'}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold active:scale-95 transition-all"
                    >
                        {isHindi ? 'होम पर जाएं' : 'Back to Home'}
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        {isHindi ? 'यहीं रहें' : 'Stay Here'}
                    </button>
                </div>
            </div>
        </div>
    );
};
