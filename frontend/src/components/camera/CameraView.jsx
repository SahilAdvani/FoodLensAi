import React, { useRef, useEffect, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

export default function CameraView({ onCapture, onReady, showCaptureButton, prompt, onFileUpload }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        // If the capture button reappears (scanning mode), clear the frozen image
        if (showCaptureButton) {
            setCapturedImage(null);
        }
    }, [showCaptureButton]);

    // ... (keep useEffect for startCamera unchanged)

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCapture = () => {
        let imageDataUrl = null;

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas size to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to data URL
            imageDataUrl = canvas.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
        }

        if (onCapture && imageDataUrl) {
            onCapture(imageDataUrl);
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
            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live Video - Keep mounted but hidden if image captured */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
            />

            {/* Captured Image Overlay */}
            {capturedImage && (
                <img
                    src={capturedImage}
                    alt="Captured"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                />
            )}

            {/* Overlay UI */}
            {showCaptureButton !== false && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20 pointer-events-none">

                    {/* File Upload Button (Left Side) */}
                    {onFileUpload && (
                        <div className="pointer-events-auto">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={handleUploadClick}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                            >
                                <Upload size={24} />
                            </button>
                        </div>
                    )}

                    {/* Capture Button Ring */}
                    <div className="p-1 rounded-full border-4 border-white/30 backdrop-blur-sm pointer-events-auto">
                        <button
                            onClick={handleCapture}
                            className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                            aria-label="Capture"
                        />
                    </div>

                    {/* Empty placeholder to balance spacing if needed, or keeping it centered */}
                    {onFileUpload && <div className="w-12 h-12" />}
                </div>
            )}

            {/* Centered Prompt Text */}
            {prompt && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="bg-black/40 text-white px-6 py-2 rounded-full text-base font-medium backdrop-blur-md animate-pulse">
                        {prompt}
                    </span>
                </div>
            )}
        </div>
    );
}
