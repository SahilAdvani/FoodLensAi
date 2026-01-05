import React from 'react';
import { RefreshCw, Check, X } from 'lucide-react';

export default function LiveReview({ onRetake, onConfirm, onClose }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {/* Bottom Controls Container */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-10 pointer-events-auto animate-in slide-in-from-bottom-20 duration-300">
                {/* Retake */}
                <button
                    onClick={onRetake}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm">
                        <RefreshCw size={24} />
                    </div>
                    <span className="text-white/80 text-xs font-medium shadow-black/50 text-shadow-sm">Retake</span>
                </button>

                {/* Confirm (Center, Big) */}
                <button
                    onClick={onConfirm}
                    className="flex flex-col items-center gap-2 group -mt-4" // Lifted slightly
                >
                    <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform active:scale-95 ring-4 ring-white/30">
                        <Check size={40} />
                    </div>
                </button>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm">
                        <X size={24} />
                    </div>
                    <span className="text-white/80 text-xs font-medium shadow-black/50 text-shadow-sm">Cancel</span>
                </button>
            </div>
        </div>
    );
}
