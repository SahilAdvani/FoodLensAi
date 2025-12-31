import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/layout/Footer';
import useLoader from "@/hooks/useLoader";

export default function PrivacyPolicy() {
    useLoader(true);
    return (
        <>
            <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <SEO
                    title="Privacy Policy"
                    description="Read FoodLens AI's Privacy Policy to understand how we collect, use, and protect your data."
                    keywords="privacy policy, data protection, foodlens ai privacy, user data"
                />

                {/* Header */}
                <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
                        >
                            Privacy Policy
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Last Updated: May 20, 2025
                        </motion.p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-lg dark:prose-invert max-w-none space-y-12"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <Shield size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">1. Information We Collect</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                At FoodLens AI, we prioritize your privacy. We strictly collect only the information necessary to provide our services:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                                <li><strong>Image Data:</strong> Images you scan are processed in real-time to identify ingredients. We do not permanently store your scanned images unless you explicitly save them.</li>
                                <li><strong>Chat Logs:</strong> Conversations with the AI nutritionist are stored locally on your device or securely synced if you are logged in, to provide context for future queries.</li>
                                <li><strong>Usage Data:</strong> Anonymous analytics to help us improve app performance.</li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <Eye size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">2. How We Use Your Information</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                We use the data we collect solely for the purpose of:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                                <li>Providing instant ingredient analysis and health insights.</li>
                                <li>Personalizing your dietary recommendations based on your preferences.</li>
                                <li>Improving the accuracy of our AI models (using anonymized data only).</li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <Lock size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">3. Data Security</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                We implement industry-standard security measures to protect your data. Your personal information is never sold to third parties. All data transmission is encrypted using SSL/TLS protocols.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <FileText size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">4. Your Rights</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                                <li>Access the personal data we hold about you.</li>
                                <li>Request deletion of your data.</li>
                                <li>Opt-out of anonymous usage analytics.</li>
                            </ul>
                            <p className="mt-6 text-gray-600 dark:text-gray-300">
                                For any privacy-related inquiries, please contact us at <a href="mailto:privacy@foodlens.ai" className="text-green-600 hover:underline">privacy@foodlens.ai</a>.
                            </p>
                        </div>
                    </motion.div>
                </section>
            </div>
            <Footer />
        </>
    );
}
