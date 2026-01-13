import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addMessage, setLoading, clearCurrentChat } from '@/store/chatSlice';
import VoiceInput from '@/components/chat/VoiceInput';
import CameraView from '@/components/camera/CameraView';
import { Send, Bot, Loader2, Camera as CameraIcon, X, RefreshCw, Check, ArrowLeft, Lock } from 'lucide-react';
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

  useLoader(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useSelector((state) => state.language);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 text-center animate-in fade-in duration-500">
        <SEO title="AI Chat - Login" />
        <div className="bg-green-100 dark:bg-green-900/30 p-8 rounded-full mb-6 shadow-inner">
          <Lock size={48} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {t('chat.loginRequired')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          {currentLanguage === 'hi-IN' ? "पोषण संबंधी सलाह लेने और अपना इतिहास सहेजने के लिए लॉगिन करें।" : "Unlock personalized nutrition advice and save your chat history."}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {t('chat.loginToStart')}
        </button>
      </div>
    );
  }

  // Use route param as source of truth for ID if present
  const [sessionId, setSessionId] = useState(routeSessionId || null);

  // Redux & Local State
  const { currentChat, isLoading } = useSelector((state) => state.chat);
  const [inputStr, setInputStr] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const justCreatedSessionId = useRef(null);

  const [recentSessions, setRecentSessions] = useState([]);

  // Initialize Session & Load History
  useEffect(() => {
    const initChat = async () => {
      // If URL has ID, load it
      if (routeSessionId) {

        if (justCreatedSessionId.current === routeSessionId) {
          setSessionId(routeSessionId);
          return;
        }

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
        justCreatedSessionId.current = currentSess;
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
      setShowCamera(true);
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
        justCreatedSessionId.current = currentSess;
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-3 py-2 sm:p-4 relative bg-gray-50 dark:bg-gray-950">

      {/* SEO */}
      <SEO
        title="AI Chat"
        description="Chat with FoodLens AI nutritionist. Ask questions about ingredients, allergies, and health benefits."
        keywords="nutrition chat, food ai assistant, diet advice, ingredient questions"
      />

      {/* Back Button */}
      {sessionId && (
        <button
          onClick={() => navigate("/chat")}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-safe bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm sm:max-w-sm h-[85vh] sm:h-auto sm:aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col">

            {/* Close */}
            {!reviewMode && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X size={22} />
              </button>
            )}

            {/* Camera */}
            <CameraView
              isActive={true}
              className="flex-1 rounded-none sm:rounded-none"
              onCapture={handleCapture}
              onFileUpload={handleFileUpload}
              showCaptureButton={!reviewMode}
              imageSrc={capturedImage}

            />

            {/* Tap to Scan */}
            {!reviewMode && (
              <div className="absolute bottom-0 left-0 right-0 py-2 text-center text-sm text-white bg-black/40 backdrop-blur">
                {t("chat.tapToScan")}
              </div>
            )}

            {/* Review Controls */}
            {reviewMode && (
              <div className="absolute inset-0 z-50 flex items-end justify-center pb-6 pointer-events-none">
                <div className="flex gap-5 pointer-events-auto">
                  <button
                    onClick={handleRetake}
                    className="w-14 h-14 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <RefreshCw size={22} />
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <X size={22} />
                  </button>

                  <button
                    onClick={handleConfirm}
                    className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xl ring-4 ring-white/30 active:scale-95"
                  >
                    <Check size={30} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Chats */}
      {!sessionId && (
        <>
          <div className="sm:hidden mb-3">
            <RecentChats sessions={recentSessions.slice(0, 2)} />
          </div>
          <div className="hidden sm:block">
            <RecentChats sessions={recentSessions} />
          </div>
        </>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 custom-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
        data-lenis-prevent
      >
        {currentChat.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Bot size={18} />
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border shadow-sm flex items-center">
              <Loader2 size={14} className="animate-spin text-green-600" />
              <span className="ml-2 text-xs text-gray-500">
                {showCamera ? t("chat.waitingPhoto") : t("chat.thinking")}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-md p-2 flex items-center gap-2 pb-safe mt-2">
        <button
          onClick={() => setShowCamera(true)}
          className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <CameraIcon size={18} />
        </button>

        <VoiceInput
          onTranscript={setInputStr}
          lang={currentLanguage === "hi-IN" ? "hi-IN" : "en-US"}
        />

        <input
          type="text"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t("chat.placeholder")}
          className="flex-1 bg-transparent outline-none px-2 text-base text-gray-800 dark:text-white"
        />

        <button
          onClick={() => handleSendMessage(inputStr)}
          disabled={!inputStr.trim() || isLoading}
          className="p-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );


}
