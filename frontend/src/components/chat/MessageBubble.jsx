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

                {isUser ? (
                    msg.content
                ) : (
                    msg.animate ? (
                        <TypingMessage content={msg.content} />
                    ) : (
                        <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
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
