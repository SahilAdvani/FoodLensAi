import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import TypingMessage from './TypingMessage';

const MessageBubble = ({ msg }) => {
    const isUser = msg.role === 'user';

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-full flex-shrink-0 ${isUser ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                {isUser ? <User size={20} /> : <Bot size={20} />}
            </div>

            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${isUser
                ? 'bg-green-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                }`}>

                {msg.image && (
                    <div className="mb-2">
                        <img 
                            src={msg.image} 
                            alt="Uploaded food label" 
                            className="max-w-xs sm:max-w-md max-h-60 rounded-xl object-cover border border-black/10 dark:border-white/10 shadow-sm" 
                        />
                    </div>
                )}

                {isUser ? (
                    msg.content
                ) : (
                    msg.animate ? (
                        <TypingMessage content={msg.content} />
                    ) : (
                        <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    h3: ({ node, children, ...props }) => {
                                        const text = String(children);
                                        let bgClass = "text-gray-900 dark:text-white";
                                        if (text.includes('🟢') || text.includes('Safe') || text.includes('✅')) {
                                            bgClass = "text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5";
                                        } else if (text.includes('🟡') || text.includes('Caution') || text.includes('⚠️')) {
                                            bgClass = "text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5";
                                        } else if (text.includes('🔴') || text.includes('Avoid') || text.includes('Unsafe')) {
                                            bgClass = "text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5";
                                        }
                                        return <h3 className={`text-base font-bold mt-4 mb-2 first:mt-0 ${bgClass}`} {...props}>{children}</h3>;
                                    },
                                    strong: ({ node, children, ...props }) => {
                                        const text = String(children);
                                        if (text.toLowerCase() === 'role' || text.toLowerCase() === 'evidence' || text.toLowerCase() === 'explanation') {
                                            return <strong className="text-gray-500 dark:text-gray-400 font-medium" {...props}>{children}: </strong>;
                                        }
                                        return <strong className="font-bold text-gray-900 dark:text-white" {...props}>{children}</strong>;
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
