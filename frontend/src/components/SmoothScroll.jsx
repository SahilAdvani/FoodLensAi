import React from 'react';
import useLenis from '@/hooks/useLenis';

const SmoothScroll = ({ children }) => {
    useLenis();
    return <>{children}</>;
};

export default SmoothScroll;
