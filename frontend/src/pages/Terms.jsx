import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileWarning, ShieldAlert, Ban } from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/layout/Footer';
import useLoader from "@/hooks/useLoader";

export default function Terms() {
    useLoader(true);
    return (
        <>
            <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <SEO
                    title="Terms of Service"
                    description="Terms and conditions for using FoodLens AI services."
                    keywords="terms of service, legal, rules, user agreement"
                />

                {/* Header */}
                <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
                        >
                            Terms of Service
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Effective Date: May 20, 2025
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
                                <Scale size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">1. Acceptance of Terms</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                By accessing or using FoodLens AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <FileWarning size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">2. Use of Service</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                You agree to use FoodLens AI only for lawful purposes. You must not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                                <li>Use the service to analyze illegal substances.</li>
                                <li>Attempt to reverse engineer or disrupt the application infrastructure.</li>
                                <li>Harass or harm others through the use of the platform.</li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <ShieldAlert size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">3. Limitation of Liability</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                FoodLens AI provides nutritional information for educational purposes only. It relates to food safety and health, but:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                                <li><strong>Not Medical Advice:</strong> We are not a substitute for professional medical advice. Always consult a healthcare provider for allergies or dietary conditions.</li>
                                <li><strong>No Warranty:</strong> While we strive for accuracy, AI analysis may occasionally be incorrect. We do not guarantee 100% accuracy of ingredient identification.</li>
                            </ul>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                                <Ban size={28} />
                                <h2 className="text-2xl font-bold m-0 text-gray-900 dark:text-gray-100">4. Termination</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                                We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                            </p>
                        </div>
                    </motion.div>
                </section>
            </div>
            <Footer />
        </>
    );
}
