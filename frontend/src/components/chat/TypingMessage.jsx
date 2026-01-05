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
            <ReactMarkdown components={{ p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} /> }}>
                {displayedContent}
            </ReactMarkdown>
        </div>
    );
};

export default TypingMessage;
