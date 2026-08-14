import React, { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";

const TypingMessage = ({ content }) => {
    const [displayedContent, setDisplayedContent] = useState('');

    useEffect(() => {
        let index = 0;
        setDisplayedContent('');
        const interval = setInterval(() => {
            setDisplayedContent((prev) => content.slice(0, index));
            index++;
            if (index > content.length) {
                clearInterval(interval);
            }
        }, 10); // 10ms per char
        return () => clearInterval(interval);
    }, [content]);

    return (
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
                {displayedContent}
            </ReactMarkdown>
        </div>
    );
};

export default TypingMessage;
