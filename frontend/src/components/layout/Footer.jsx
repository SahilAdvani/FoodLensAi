import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail, Send } from 'lucide-react';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6">

                {/* Top Section: Newsletter & Brand */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16 border-b border-gray-800 pb-12">
                    <div className="max-w-md">
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{t('navbar.brand')}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {t('footer.brandDescription')}
                        </p>
                    </div>

                    <div className="w-full lg:w-auto bg-gray-800/50 p-1 rounded-full flex items-center border border-gray-700 focus-within:border-green-500 transition-colors">
                        <div className="pl-4 text-gray-400">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder={t('footer.subscribePlaceholder')}
                            className="bg-transparent border-none outline-none text-white px-4 py-3 w-full lg:w-80 placeholder:text-gray-500"
                        />
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2">
                            {t('footer.subscribeButton')} <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* Middle Section: Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

                    {/* Column 1 */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">{t('footer.product')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/live" className="text-gray-400 hover:text-green-400 transition-colors">{t('navbar.live')}</Link></li>
                            <li><Link to="/chat" className="text-gray-400 hover:text-green-400 transition-colors">{t('navbar.chat')}</Link></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">{t('footer.company')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">{t('footer.resources')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">Community</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">{t('footer.legal')}</h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-800">
                    <p className="text-gray-500 text-sm">
                        {t('footer.copyright', { year: currentYear })}
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-green-600"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-green-600"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-pink-600"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-blue-600"><Linkedin size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-gray-600"><Github size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
