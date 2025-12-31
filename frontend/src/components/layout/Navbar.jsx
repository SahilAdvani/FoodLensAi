import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '@/store/languageSlice';
import { setTheme } from '@/store/themeSlice';
import { Sun, Moon, Monitor, Languages, Camera, MessageSquare, ChevronDown, Menu, X, Download, Info, Mail, Shield, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '@/assets/logo_minimal.png';

export default function Navbar() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { currentLanguage } = useSelector((state) => state.language);
    const { mode } = useSelector((state) => state.theme);
    const clerk = useClerk();

    // UI States
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    // Refs
    const themeRef = useRef(null);
    const moreMenuRef = useRef(null);

    // PWA Install State
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (themeRef.current && !themeRef.current.contains(event.target)) setIsThemeOpen(false);
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setIsMoreMenuOpen(false);
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

                    {/* LEFT: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <img src={logo} alt="FoodLens AI" className="h-8 w-8 object-contain" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                                {t('navbar.brand')}
                            </span>
                        </Link>
                    </div>

                    {/* CENTER: Desktop Nav (Live, Chat) */}
                    <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/live" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2 font-medium">
                            <Camera size={20} /> {t('navbar.live')}
                        </Link>
                        <Link to="/chat" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2 font-medium">
                            <MessageSquare size={20} /> {t('navbar.chat')}
                        </Link>
                    </div>

                    {/* RIGHT (Desktop): Actions + More Dropdown */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <div className="relative" ref={themeRef}>
                            <button
                                onClick={() => setIsThemeOpen(!isThemeOpen)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                            >
                                {React.createElement(currentThemeIcon, { size: 20 })}
                            </button>
                            <AnimatePresence>
                                {isThemeOpen && (
                                    <DropdownMenu>
                                        {themeOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => { dispatch(setTheme(option.id)); setIsThemeOpen(false); }}
                                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${mode === option.id ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                            >
                                                <option.icon size={16} /> {option.label}
                                            </button>
                                        ))}
                                    </DropdownMenu>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => dispatch(toggleLanguage())}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium text-sm"
                        >
                            {currentLanguage === 'en-IN' ? 'EN' : 'HI'}
                        </button>

                        {/* Auth moved before More */}
                        <div className="">
                            <SignedOut>
                                <button onClick={() => clerk.openSignIn()} className="text-gray-700 dark:text-gray-200 hover:text-green-600 font-medium text-sm">
                                    {t('navbar.login')}
                                </button>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>


                        {/* More Dropdown */}
                        <div className="relative" ref={moreMenuRef}>
                            <button
                                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                            >
                                <span className="font-medium">More</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isMoreMenuOpen && (
                                    <DropdownMenu>
                                        <DropdownLink to="/about" icon={Info} label="About" onClick={() => setIsMoreMenuOpen(false)} />
                                        <DropdownLink to="/contact" icon={Mail} label="Contact" onClick={() => setIsMoreMenuOpen(false)} />
                                        <DropdownLink to="/terms" icon={FileText} label="Terms" onClick={() => setIsMoreMenuOpen(false)} />
                                        <DropdownLink to="/privacy" icon={Shield} label="Privacy" onClick={() => setIsMoreMenuOpen(false)} />
                                    </DropdownMenu>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT (Mobile): Install, Hamburger */}
                    <div className="flex md:hidden items-center space-x-3">
                        {/* Install Button */}
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            >
                                <Download size={20} />
                            </button>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            {/* Main Links */}
                            <div className="grid grid-cols-2 gap-4">
                                <MobileLink to="/live" icon={Camera} label={t('navbar.live')} onClick={() => setIsMobileMenuOpen(false)} />
                                <MobileLink to="/chat" icon={MessageSquare} label={t('navbar.chat')} onClick={() => setIsMobileMenuOpen(false)} />
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            {/* Secondary Links */}
                            <div className="space-y-1">
                                <MobileSimpleLink to="/about" icon={Info} label="About" onClick={() => setIsMobileMenuOpen(false)} />
                                <MobileSimpleLink to="/contact" icon={Mail} label="Contact" onClick={() => setIsMobileMenuOpen(false)} />
                                <MobileSimpleLink to="/terms" icon={FileText} label="Terms of Service" onClick={() => setIsMobileMenuOpen(false)} />
                                <MobileSimpleLink to="/privacy" icon={Shield} label="Privacy Policy" onClick={() => setIsMobileMenuOpen(false)} />
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            {/* Controls */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => dispatch(toggleLanguage())} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Languages size={18} />
                                        <span>{currentLanguage === 'en-IN' ? 'English' : 'Hindi'}</span>
                                    </button>
                                    <button onClick={() => dispatch(setTheme(mode === 'dark' ? 'light' : 'dark'))} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                        <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                    </button>
                                </div>
                                <div className="">
                                    <SignedOut>
                                        <button onClick={() => clerk.openSignIn()} className="text-sm font-medium text-green-600">Login</button>
                                    </SignedOut>
                                    <SignedIn>
                                        <UserButton afterSignOutUrl="/" />
                                    </SignedIn>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

// Helper Components
function DropdownMenu({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50 py-1"
        >
            {children}
        </motion.div>
    );
}

function DropdownLink({ to, icon: Icon, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
            <Icon size={16} />
            {label}
        </Link>
    );
}

function MobileLink({ to, icon: Icon, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
        >
            <Icon size={24} className="mb-2 text-green-600" />
            {label}
        </Link>
    );
}

function MobileSimpleLink({ to, icon: Icon, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-2 py-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 font-medium"
        >
            <Icon size={20} />
            {label}
        </Link>
    );
}
