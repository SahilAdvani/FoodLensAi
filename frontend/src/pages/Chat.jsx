import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addMessage, setLoading } from '@/store/chatSlice';
import VoiceInput from '@/components/chat/VoiceInput';
import CameraView from '@/components/camera/CameraView';
import { MOCK_INGREDIENTS } from '@/constants/mockData';
import { Send, User, Bot, Loader2, Camera as CameraIcon, X, RefreshCw, Check } from 'lucide-react';

export default function Chat() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentChat, isLoading } = useSelector((state) => state.chat);
  const { currentLanguage } = useSelector((state) => state.language);
  const [inputStr, setInputStr] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, isLoading]);

  // Initial Greeting
  useEffect(() => {
    if (currentChat.length === 0) {
      const greeting = currentLanguage === 'hi-IN'
        ? "नमस्ते! क्या आप किसी सामग्री के बारे में जानना चाहते हैं? 'स्कैन' टाइप करें या मुझसे पूछें।"
        : "Hello! Want to check ingredients? Type 'scan' or ask me.";
      dispatch(addMessage({ role: 'ai', content: greeting }));
    }
  }, [currentLanguage]); // Run when lang changes or mount (if empty)

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    dispatch(addMessage({ role: 'user', content: text }));
    setInputStr('');
    dispatch(setLoading(true));

    // Simulate AI decision to open camera
    // For demo: Always open camera if text is "scan", or randomly for others? 
    // User requested "after some msg a camera api call". Let's do it for any message for now to demo.

    setTimeout(() => {
      const aiPreText = currentLanguage === 'hi-IN'
        ? "मैं मदद कर सकता हूँ। कृपया मुझे सामग्री दिखाएं।"
        : "I can help with that. Please show me the ingredient.";

      dispatch(addMessage({ role: 'ai', content: aiPreText }));
      setShowCamera(true);
      setReviewMode(false);
      dispatch(setLoading(false));
    }, 1000);
  };

  const handleCapture = () => {
    setReviewMode(true);
  };

  const handleRetake = () => {
    setReviewMode(false);
  };

  const handleClose = () => {
    setShowCamera(false);
    setReviewMode(false);
  };

  const handleConfirm = () => {
    setShowCamera(false);
    setReviewMode(false);
    dispatch(setLoading(true)); // Analyzing state

    setTimeout(() => {
      const randomIngredient = MOCK_INGREDIENTS[Math.floor(Math.random() * MOCK_INGREDIENTS.length)];
      const desc = currentLanguage === 'hi-IN' ? randomIngredient.description : randomIngredient.description;

      const resultText = currentLanguage === 'hi-IN'
        ? `मुझे मिला: ${randomIngredient.name}. ${desc}`
        : `I found: ${randomIngredient.name}. ${desc}`;

      dispatch(addMessage({ role: 'ai', content: resultText }));
      dispatch(setLoading(false));
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputStr);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4 relative">

      {/* Camera Overlay */}
      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black rounded-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
          {/* Close Button (only when not in review mode or redundant if we have center close) */}
          {!reviewMode && (
            <div className="absolute top-4 right-4 z-50">
              <button onClick={handleClose} className="bg-black/50 p-2 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
          )}

          <CameraView onCapture={handleCapture} showCaptureButton={!reviewMode} />

          {!reviewMode && (
            <div className="absolute bottom-10 left-0 right-0 text-center text-white font-medium bg-black/40 backdrop-blur-sm py-2 pointer-events-none">
              Tap circle to scan
            </div>
          )}

          {/* Review Controls */}
          {reviewMode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="flex gap-8 items-center animate-in zoom-in duration-300 pointer-events-auto mt-64">
                {/* Left: Retake */}
                <button
                  onClick={handleRetake}
                  className="w-16 h-16 rounded-full bg-gray-100/90 text-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm"
                  aria-label="Retake"
                >
                  <RefreshCw size={28} />
                </button>
                {/* Center: Close */}
                <button
                  onClick={handleClose}
                  className="w-14 h-14 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X size={28} />
                </button>
                {/* Right: Confirm */}
                <button
                  onClick={handleConfirm}
                  className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 ring-4 ring-white/30"
                  aria-label="Confirm"
                >
                  <Check size={40} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">

        {currentChat.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-green-600 text-white rounded-tr-none'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm flex items-center">
              <Loader2 size={16} className="animate-spin text-green-600" />
              <span className="ml-2 text-gray-500 text-xs">{showCamera ? 'Waiting for photo...' : 'Thinking...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-2 flex items-center gap-2 sticky bottom-0">
        <VoiceInput onTranscript={(text) => setInputStr(text)} lang={currentLanguage === 'hi-IN' ? 'hi-IN' : 'en-US'} />

        <input
          type="text"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t('chat.placeholder')}
          className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white px-2"
        />

        <button
          onClick={() => handleSendMessage(inputStr)}
          disabled={!inputStr.trim() || isLoading}
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
