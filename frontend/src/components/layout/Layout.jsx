import React from 'react';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

export default function Layout({ children }) {
    const { mode } = useSelector((state) => state.theme);

    // Apply dark mode class to html element (useEffect could be better but this works for simpler integration)
    React.useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
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
