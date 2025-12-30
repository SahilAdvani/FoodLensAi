import React from 'react';
import { Link } from 'react-router-dom';
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLanguage } from '@/store/languageSlice';
import { toggleTheme } from '@/store/themeSlice';
import { Sun, Moon, Languages, Camera, MessageSquare } from 'lucide-react';

export default function Navbar() {
    const dispatch = useDispatch();
    const { currentLanguage } = useSelector((state) => state.language);
    const { mode } = useSelector((state) => state.theme);
    const clerk = useClerk();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                            Ingredia
                        </span>
                    </Link>

                    {/* Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                            <Camera size={18} /> Live
                        </Link>
                        <Link to="/chat" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                            <MessageSquare size={18} /> Chat
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Language Toggle */}
                        <button
                            onClick={() => dispatch(toggleLanguage())}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                            aria-label="Toggle Language"
                        >
                            <span className="flex items-center gap-1 font-medium text-sm">
                                <Languages size={18} />
                                {currentLanguage === 'en-IN' ? 'EN' : 'HI'}
                            </span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                            aria-label="Toggle Theme"
                        >
                            {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* Auth */}
                        <div className="ml-2">
                            <SignedOut>
                                <button
                                    onClick={() => clerk.openSignIn()}
                                    className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
