import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setLoading } from '@/store/chatSlice';
import VoiceInput from '@/components/chat/VoiceInput';
import { Send, User, Bot, Loader2 } from 'lucide-react';

export default function Chat() {
  const dispatch = useDispatch();
  const { currentChat, isLoading } = useSelector((state) => state.chat);
  const { currentLanguage } = useSelector((state) => state.language);
  const [inputStr, setInputStr] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    dispatch(addMessage({ role: 'user', content: text }));
    setInputStr('');
    dispatch(setLoading(true));

    // Simulate AI response
    setTimeout(() => {
      let responseText = `I understand you're asking about "${text}". Here is some information...`;
      if (currentLanguage === 'hi-IN') {
        responseText = `Main samajh gaya ki aap "${text}" ke baare mein pooch rahe hain. Yahan kuch jaankari hai...`;
      }

      dispatch(addMessage({ role: 'ai', content: responseText }));
      dispatch(setLoading(false));
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputStr);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {currentChat.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <Bot size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Start asking about ingredients!</p>
          </div>
        )}

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
          placeholder={currentLanguage === 'hi-IN' ? "Yahan likhein..." : "Type your question..."}
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
