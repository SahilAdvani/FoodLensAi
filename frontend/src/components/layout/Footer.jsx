import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo_minimal.png';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <img src={logo} alt="FoodLens AI" className="h-8 w-8 object-contain" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                                FoodLens AI
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                            Your personal AI nutritionist. Making healthy eating simple, accessible, and personalized for everyone.
                        </p>
                        <div className="flex space-x-4">
                            <SocialLink href="#" icon={Facebook} />
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={Instagram} />
                            <SocialLink href="#" icon={Linkedin} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/live" label="Live Analysis" />
                            <FooterLink to="/chat" label="AI Chat" />
                            <FooterLink to="/about" label="About Us" />
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <FooterLink to="/privacy" label="Privacy Policy" />
                            <FooterLink to="/terms" label="Terms of Service" />
                            <FooterLink to="/cookies" label="Cookie Policy" />
                            <FooterLink to="/contact" label="Contact Support" />
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                <Mail size={20} className="mt-1 text-green-600" />
                                <span>support@foodlensai.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                <Phone size={20} className="mt-1 text-green-600" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                <MapPin size={20} className="mt-1 text-green-600" />
                                <span>123 Nutrition St,<br />Wellness City, WC 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        © {currentYear} FoodLens AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon: Icon }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300"
        >
            <Icon size={20} />
        </a>
    );
}

function FooterLink({ to, label }) {
    return (
        <li>
            <Link
                to={to}
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
                {label}
            </Link>
        </li>
    );
}
