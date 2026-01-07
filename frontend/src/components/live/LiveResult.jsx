import React from 'react';
import { RefreshCw, Volume2, Loader2 } from 'lucide-react';
import VoiceInput from "@/components/chat/VoiceInput";
import ReactMarkdown from "react-markdown";

export default function LiveResult({
    result,
    onReset,
    conversation,
    voiceState,
    onReplay,
    onVoiceQuery,
    language,
    voiceInputRef,
    onStopSpeaking
}) {
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-6 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-30 animate-in slide-in-from-bottom-full duration-500 border-t border-gray-100 dark:border-gray-800 flex flex-col max-h-[60vh]">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{result.name}</h2>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                        ${result.safety_level === 'Code Green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            result.safety_level === 'Code Red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {result.safety_level}
                    </div>
                </div>
                <button onClick={onReset} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors pointer-events-auto">
                    <RefreshCw size={24} />
                </button>
            </div>

            {/* Scrollable Content: Description + Conversation */}
            <div className="overflow-y-auto mb-4 custom-scrollbar flex-1">
                <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 mb-6 text-left">
                    <ReactMarkdown
                        components={{
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />,
                            p: ({ node, ...props }) => <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-2" {...props} />
                        }}
                    >
                        {result.description}
                    </ReactMarkdown>
                </div>

                {/* Conversation History */}
                {conversation.length > 0 && (
                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                        {conversation.map((turn, idx) => (
                            <div key={idx} className="space-y-2">
                                {/* User Q */}
                                <div className="flex justify-end">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[80%]">
                                        {turn.question}
                                    </div>
                                </div>
                                {/* AI A */}
                                {turn.answer ? (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-[90%]">
                                            {turn.answer}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <Loader2 size={12} className="animate-spin" /> Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center pointer-events-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 text-xs">
                    {voiceState === 'bot-speaking' && (
                        <span className="flex items-center gap-2 animate-pulse text-green-500">
                            <Volume2 size={12} /> Speaking...
                        </span>
                    )}
                </div>

                <div className="flex gap-4 items-center">
                    <button
                        onClick={onReplay}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Replay Analysis"
                    >
                        <Volume2 size={20} />
                    </button>

                    <VoiceInput
                        ref={voiceInputRef}
                        onTranscript={onVoiceQuery}
                        lang={language}
                        onStateChange={(isListening) => {
                            if (isListening) {
                                if (onStopSpeaking) onStopSpeaking();
                                else window.speechSynthesis.cancel();
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
