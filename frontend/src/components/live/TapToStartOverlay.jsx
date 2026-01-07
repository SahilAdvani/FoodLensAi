
import React from 'react';

export default function TapToStartOverlay({ onStart }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <button
                onClick={onStart}
                className="px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow-xl active:scale-95"
            >
                Tap to Start Live
            </button>
        </div>
    );
}
