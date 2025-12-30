import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '@/store/languageSlice';
import { setTheme } from '@/store/themeSlice';
import { Sun, Moon, Monitor, Languages, Camera, MessageSquare, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '@/assets/logo_minimal.png';

export default function Navbar() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { currentLanguage } = useSelector((state) => state.language);
    const { mode } = useSelector((state) => state.theme);
    const clerk = useClerk();

    // Theme Dropdown State
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const themeRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (themeRef.current && !themeRef.current.contains(event.target)) {
                setIsThemeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themeOptions = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ];

    const currentThemeIcon = themeOptions.find(t => t.id === mode)?.icon || Monitor;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="FoodLens AI" className="h-8 w-8 object-contain" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                            {t('navbar.brand')}
                        </span>
                    </Link>

                    {/* Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/live" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                            <Camera size={18} /> {t('navbar.live')}
                        </Link>
                        <Link to="/chat" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2">
                            <MessageSquare size={18} /> {t('navbar.chat')}
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

                        {/* Theme Dropdown */}
                        <div className="relative" ref={themeRef}>
                            <button
                                onClick={() => setIsThemeOpen(!isThemeOpen)}
                                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                                aria-label="Toggle Theme"
                            >
                                <React.Fragment>
                                    {React.createElement(currentThemeIcon, { size: 18 })}
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
                                </React.Fragment>
                            </button>

                            <AnimatePresence>
                                {isThemeOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50"
                                    >
                                        {themeOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    dispatch(setTheme(option.id));
                                                    setIsThemeOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                                                    ${mode === option.id
                                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <option.icon size={16} />
                                                {option.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Auth */}
                        <div className="ml-2">
                            <SignedOut>
                                <button
                                    onClick={() => clerk.openSignIn()}
                                    className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                                >
                                    {t('navbar.login')}
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
