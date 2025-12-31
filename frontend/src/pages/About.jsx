import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Zap, Users, Globe, Award } from 'lucide-react';
import SEO from '@/components/SEO';
import Footer from '@/components/layout/Footer';
import useLoader from "@/hooks/useLoader";

export default function About() {
    useLoader(true);
    return (
        <>
            <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <SEO
                    title="About Us"
                    description="Our mission at FoodLens AI is to empower everyone to make healthier food choices through instant, AI-powered ingredient analysis."
                    keywords="about foodlens, mission, health tech, team, vision"
                />

                {/* Hero Section */}
                <section className="relative overflow-hidden py-24 sm:py-32">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-bold tracking-tight mb-8 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
                        >
                            Empowering Healthier Choices
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
                        >
                            We believe that understanding what you eat shouldn't be complicated.
                            FoodLens AI combines cutting-edge computer vision with nutritional science
                            to bring transparency to your diet.
                        </motion.p>
                    </div>
                </section>

                {/* Stats/Mission Grid */}
                <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {[
                                { icon: ShieldCheck, label: "Safety First", desc: "Instantly identify allergens and harmful additives." },
                                { icon: Zap, label: "Real-Time", desc: "Get analysis in milliseconds, right from your camera." },
                                { icon: Globe, label: "Universal", desc: "Recognizing thousands of global ingredients." }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                                        <stat.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{stat.label}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{stat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-24 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Transparency</h2>
                            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                <p>
                                    The idea for FoodLens AI started with a simple frustration: reading tiny ingredient labels
                                    and trying to decipher complex chemical names.
                                </p>
                                <p>
                                    We realized that in a world of processed foods, transparency is a superpower.
                                    By leveraging advanced AI, we translate those complex labels into simple, actionable
                                    health insights.
                                </p>
                                <div className="flex gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                        <Users size={18} />
                                        <span>Community Driven</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                        <Award size={18} />
                                        <span>Expert Backed</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl rotate-3 opacity-20 blur-lg transform scale-95"></div>
                        <img
                            src="/hero-scan.png"
                            alt="Our Vision"
                            className="relative rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 -rotate-3 hover:rotate-0 transition-transform duration-500"
                        />
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to eat smarter?</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                            Join thousands of users who are taking control of their nutrition today.
                        </p>
                        <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1">
                            Start Scanning Now
                        </button>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
