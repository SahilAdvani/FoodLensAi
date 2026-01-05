import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addMessage, setLoading, clearCurrentChat } from '@/store/chatSlice';
import VoiceInput from '@/components/chat/VoiceInput';
import CameraView from '@/components/camera/CameraView';
import { Send, Bot, Loader2, Camera as CameraIcon, X, RefreshCw, Check, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import useLoader from "@/hooks/useLoader";
import { useAuth } from "@/context/AuthContext";
import { createSession, sendMessage, getChatHistory, analyzeImage, getUserSessions, generateSessionTitle } from "@/services/api";

// Subcomponents
import MessageBubble from '@/components/chat/MessageBubble';
import RecentChats from '@/components/chat/RecentChats';

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();

  useLoader(true);
  const { t } = useTranslation();
  const { user } = useAuth();

  // Use route param as source of truth for ID if present
  const [sessionId, setSessionId] = useState(routeSessionId || null);

  // Redux & Local State
  const { currentChat, isLoading } = useSelector((state) => state.chat);
  const { currentLanguage } = useSelector((state) => state.language);
  const [inputStr, setInputStr] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const [recentSessions, setRecentSessions] = useState([]);

  // Initialize Session & Load History
  useEffect(() => {
    const initChat = async () => {
      // If URL has ID, load it
      if (routeSessionId) {
        setSessionId(routeSessionId);
        try {
          dispatch(clearCurrentChat());
          const history = await getChatHistory(routeSessionId);
          if (history && history.length > 0) {
            history.forEach(msg => {
              dispatch(addMessage({ role: msg.role === 'assistant' ? 'ai' : 'user', content: msg.content }));
            });
          }
        } catch (e) {
          console.error("Failed to load history", e);
        }
      } else {
        // No ID in URL -> New Session
        setSessionId(null);
        dispatch(clearCurrentChat());

        // Load Recent Sessions
        if (user?.id) {
          try {
            const sessions = await getUserSessions(user.id);
            setRecentSessions(sessions.slice(0, 4)); // Top 4 recent
          } catch (e) {
            console.error("Failed to load recent sessions", e);
          }
        }

        const greeting = currentLanguage === 'hi-IN'
          ? "नमस्ते! क्या आप किसी सामग्री के बारे में जानना चाहते हैं?"
          : "Hello! I am your AI nutritionist. Ask me anything about food ingredients.";
        dispatch(addMessage({ role: 'ai', content: greeting }));
      }
    };
    initChat();
  }, [routeSessionId, user, dispatch, currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Auto-trigger Camera if keywords detected
    const lowerText = text.toLowerCase();
    if (lowerText.includes('upload') || lowerText.includes('image') || lowerText.includes('photo') || lowerText.includes('scan')) {
      setShowCamera(true);
      setInputStr('');
      return;
    }

    // Add user message locally
    dispatch(addMessage({ role: 'user', content: text }));
    setInputStr('');
    dispatch(setLoading(true));

    try {
      // Ensure session
      let currentSess = sessionId;
      if (!currentSess) {
        currentSess = await createSession("chat", user?.id);
        setSessionId(currentSess);
        // Persist session in URL without component reload
        navigate(`/chat/${currentSess}`, { replace: true });
      }

      const response = await sendMessage(currentSess, text, user?.id);
      dispatch(addMessage({ role: 'ai', content: response.content, animate: true }));

      // Generate Title for new chats (Fire & Forget)
      if (currentChat.length < 2) {
        generateSessionTitle(currentSess, text);
      }

    } catch (error) {
      console.error("Send message failed", error);
      dispatch(addMessage({ role: 'ai', content: t('chat.errorConnection') }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setReviewMode(true);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
      setReviewMode(true);
      setShowCamera(true); // Ensure camera overlay is visible for review
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setReviewMode(false);
    setCapturedImage(null);
  };

  const handleClose = () => {
    setShowCamera(false);
    setReviewMode(false);
    setCapturedImage(null);
  };

  const handleConfirm = async () => {
    setShowCamera(false);
    setReviewMode(false);
    dispatch(setLoading(true));

    try {
      let currentSess = sessionId;
      if (!currentSess) {
        currentSess = await createSession("chat", user?.id);
        setSessionId(currentSess);
        navigate(`/chat/${currentSess}`, { replace: true });
      }

      // Convert base64 to blob
      let imageBlob = capturedImage;
      if (typeof capturedImage === 'string' && capturedImage.startsWith('data:')) {
        const res = await fetch(capturedImage);
        imageBlob = await res.blob();
      }

      const data = await analyzeImage(imageBlob, currentSess, user?.id);
      const resultData = data.data;

      // Parse Analysis result
      let responseText = "Use Markdown to display result."; // Fallback

      if (resultData && resultData.analysis) {
        let jsonString = resultData.analysis;
        // Clean markdown
        if (jsonString.includes('```json')) {
          jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
        } else if (jsonString.includes('```')) {
          jsonString = jsonString.replace(/```/g, '');
        }

        try {
          const parsed = JSON.parse(jsonString);
          if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
            responseText = parsed.results.map(item => {
              const evidence = item.evidence || "";
              const safety = (evidence.toLowerCase().includes("risk") || evidence.toLowerCase().includes("unsafe")) ? "⚠️ Caution" : "✅ Safe";
              return `### ${item.ingredient} ${safety}\n${item.evidence ? `*Evidence: ${item.evidence}*\n` : ''}${item.explanation}`;
            }).join('\n\n');
          } else {
            responseText = resultData.message || "I couldn't identify any clear ingredients in the image.";
          }
        } catch (e) {
          responseText = resultData.analysis; // If not JSON, just show the raw text
        }
      } else {
        responseText = "Analysis complete, but I couldn't get a specific explanation.";
      }

      dispatch(addMessage({ role: 'ai', content: responseText, animate: true }));

      // Generate Title for scan
      if (currentChat.length < 2) {
        const title = responseText.includes("**I found:**")
          ? responseText.split("**I found:**")[1].split("**")[0].trim()
          : "Food Analysis";
        generateSessionTitle(currentSess, title);
      }

    } catch (error) {
      console.error("Analysis failed", error);
      dispatch(addMessage({ role: 'ai', content: t('chat.errorAnalysis') }));
    } finally {
      dispatch(setLoading(false));
      setCapturedImage(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputStr);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4 relative">
      <SEO
        title="AI Chat"
        description="Chat with FoodLens AI nutritionist. Ask questions about ingredients, allergies, and health benefits."
        keywords="nutrition chat, food ai assistant, diet advice, ingredient questions"
      />

      {/* Camera Overlay */}
      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black rounded-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
          {!reviewMode && (
            <div className="absolute top-4 right-4 z-50">
              <button onClick={handleClose} className="bg-black/50 p-2 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
          )}

          <CameraView
            onCapture={handleCapture}
            showCaptureButton={!reviewMode}
            onFileUpload={handleFileUpload}
          />

          {!reviewMode && (
            <div className="absolute bottom-10 left-0 right-0 text-center text-white font-medium bg-black/40 backdrop-blur-sm py-2 pointer-events-none">
              {t('chat.tapToScan')}
            </div>
          )}

          {/* Review Controls */}
          {reviewMode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="flex gap-8 items-center animate-in zoom-in duration-300 pointer-events-auto mt-64">
                <button
                  onClick={handleRetake}
                  className="w-16 h-16 rounded-full bg-gray-100/90 text-gray-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm"
                  aria-label="Retake"
                >
                  <RefreshCw size={28} />
                </button>
                <button
                  onClick={handleClose}
                  className="w-14 h-14 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X size={28} />
                </button>
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

      {/* Header / Top Navigation */}
      {sessionId && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={() => navigate('/chat')}
            className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-sm backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('chat.back')}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      )}

      {/* Recent History Component */}
      {!sessionId && <RecentChats sessions={recentSessions} />}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar" data-lenis-prevent>
        {currentChat.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm flex items-center">
              <Loader2 size={16} className="animate-spin text-green-600" />
              <span className="ml-2 text-gray-500 text-xs">{showCamera ? t('chat.waitingPhoto') : t('chat.thinking')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm p-2 flex items-center gap-2 sticky bottom-0">
        <button
          onClick={() => setShowCamera(true)}
          className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={t('chat.uploadScan')}
        >
          <CameraIcon size={20} />
        </button>
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
