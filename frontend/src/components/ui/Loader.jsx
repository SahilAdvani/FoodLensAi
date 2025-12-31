import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo_minimal.png';

export default function Loader() {
    const { isLoading } = useSelector((state) => state.loader);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300"
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Logo */}
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            src={logo}
                            alt="FoodLens AI"
                            className="w-16 h-16 object-contain"
                        />

                        {/* Brand Name */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
                        >
                            FoodLens<span className="text-green-600">AI</span>
                        </motion.h1>

                        {/* Linear Loader */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "150px", opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-[150px]"
                        >
                            <motion.div
                                className="h-full bg-green-600"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
