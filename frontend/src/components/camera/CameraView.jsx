import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';

export default function CameraView({ onCapture, onReady, showCaptureButton }) {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
                if (onReady) onReady();
            } catch (err) {
                console.error("Camera access denied:", err);
                setError("Camera access denied. Please allow camera access to use Live Mode.");
            }
        };

        startCamera();

        return () => {
            // Cleanup streams
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        // Determine context (simple image capture for now)
        // In a real app, we'd draw to a canvas
        if (onCapture) {
            onCapture();
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-2xl p-8 text-center text-red-500">
                <Camera size={48} className="mb-4 opacity-50" />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden bg-black shadow-xl">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay UI */}
            {showCaptureButton !== false && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-10 pointer-events-none">
                    {/* Capture Button Ring */}
                    <div className="p-1 rounded-full border-4 border-white/30 backdrop-blur-sm pointer-events-auto">
                        <button
                            onClick={handleCapture}
                            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                            aria-label="Capture"
                        />
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/40 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md">
                    Point at food ingredients
                </span>
            </div>
        </div>
    );
}
