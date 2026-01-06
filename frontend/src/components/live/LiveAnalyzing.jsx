import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LiveAnalyzing() {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <Loader2 size={32} className="absolute inset-0 m-auto text-green-500 animate-pulse" />
            </div>
            <p className="text-white font-medium text-xl tracking-wide">{t('live.analyzing')}</p>
        </div>
    );
}
