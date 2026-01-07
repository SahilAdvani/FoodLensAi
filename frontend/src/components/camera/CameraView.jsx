import React, { useRef, useEffect, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

export default function CameraView({ isActive, onCapture, onReady, showCaptureButton, prompt, onFileUpload, imageSrc, className }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {

        if (showCaptureButton) {
            setCapturedImage(null);
        }
    }, [showCaptureButton]);

    // ... (keep useEffect for startCamera unchanged)

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                if (!isActive) return;

                stream = await navigator.mediaDevices.getUserMedia({
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

        if (isActive) {
            startCamera();
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isActive, onReady]);

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

    const displayImage = imageSrc || capturedImage;

    return (
        <div
            className={`relative bg-black overflow-hidden w-full h-full ${className || ''}`}
        >
            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${displayImage ? 'hidden' : ''
                    }`}
            />

            {/* Captured Image */}
            {displayImage && (
                <img
                    src={displayImage}
                    alt="Captured"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                />
            )}

            {/* Bottom Controls */}
            {showCaptureButton !== false && !displayImage && (
                <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center gap-6 z-20 pointer-events-none">

                    {/* Upload */}
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
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full
              bg-white/20 backdrop-blur-sm text-white
              hover:bg-white/40 transition"
                            >
                                <Upload size={22} />
                            </button>
                        </div>
                    )}

                    {/* Capture */}
                    <div className="p-1 rounded-full border-4 border-white/30 pointer-events-auto">
                        <button
                            onClick={handleCapture}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full
            bg-white hover:bg-gray-100 active:scale-95 shadow-lg"
                            aria-label="Capture"
                        />
                    </div>

                    {onFileUpload && <div className="w-11 h-11 sm:w-12 sm:h-12" />}
                </div>
            )}

            {/* Prompt */}
            {prompt && !displayImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="bg-black/40 text-white px-5 py-2 rounded-full text-sm sm:text-base backdrop-blur-md">
                        {prompt}
                    </span>
                </div>
            )}
        </div>
    );

}
