import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CameraView from '@/components/camera/CameraView';
import { analyzeImage } from '@/services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function MobileConnect() {
    const { sessionId } = useParams();
    const [status, setStatus] = useState('scanning'); // scanning | uploading | success | error | expired
    const [errorMsg, setErrorMsg] = useState('');

    const handleCapture = async (imageSrc) => {
        setStatus('uploading');
        try {
            // Convert base64 to blob
            const res = await fetch(imageSrc);
            const blob = await res.blob();

            // Send to backend
            await analyzeImage(blob, sessionId, null, 'en-US'); // No user_id for mobile guest

            setStatus('success');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                setStatus('expired');
            } else {
                setStatus('error');
                setErrorMsg("Upload failed. Please try again.");
            }
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4 text-center">
                <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Image Sent!</h1>
                <p className="text-gray-600 mt-2">Check your desktop screen for results.</p>
                <p className="text-sm text-gray-400 mt-8">You can close this tab.</p>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
                <XCircle className="w-20 h-20 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Session Expired</h1>
                <p className="text-gray-600 mt-2">This connection code has expired (10 min limit).</p>
                <p className="text-sm text-gray-500 mt-4">Please refresh the desktop page to generate a new code.</p>
            </div>
        );
    }

    if (status === 'uploading') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <p className="text-white">Uploading & Analyzing...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <div className="p-4 bg-black text-white text-center border-b border-gray-800">
                <h1 className="font-bold">Mobile Camera</h1>
                <p className="text-xs text-gray-400">Connected to Desktop Session</p>
            </div>

            <div className="flex-1 relative">
                <CameraView
                    onCapture={handleCapture}
                    showCaptureButton={true}
                    prompt="Take a photo of the ingredients"
                    imageSrc={null}
                    onFileUpload={() => { }} // Disable file upload on mobile for simplicity, or keep if needed
                />
            </div>

            {status === 'error' && (
                <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center z-50">
                    {errorMsg}
                    <button onClick={() => setStatus('scanning')} className="block w-full mt-2 text-sm font-bold underline">Try Again</button>
                </div>
            )}
        </div>
    );
}
