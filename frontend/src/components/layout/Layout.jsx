import React from 'react';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

export default function Layout({ children }) {
    const { mode } = useSelector((state) => state.theme);

    React.useEffect(() => {
        const root = document.documentElement;

        if (mode === 'dark') {
            root.classList.add('dark');
        } else if (mode === 'light') {
            root.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [mode]);

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
            <Navbar />
            <main className="pt-16 min-h-[calc(100vh-4rem)]">
                {children}
            </main>
        </div>
    );
}
