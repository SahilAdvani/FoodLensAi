import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageSquare, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Understand what you <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Eat in seconds.
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            FoodLensAI helps you decode food labels instantly. Just point your camera or ask a question to get simple, human-friendly explanations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/live" className="group px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30">
              <Camera size={20} />
              Try Live Mode
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/chat" className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              <MessageSquare size={20} />
              Start Chatting
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="text-yellow-500" size={32} />}
            title="Instant Scanning"
            description="Point your camera at any ingredient label to get an immediate analysis of additives and nutrition."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-green-500" size={32} />}
            title="Safety First"
            description="Know what's safe. We flag harmful additives with clear color codes: Green, Yellow, and Red."
          />
          <FeatureCard
            icon={<Globe className="text-blue-500" size={32} />}
            title="Multi-Language"
            description="Accessible to everyone. Switch between English and Hindi for both text and voice explanations."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
    >
      <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-2xl w-fit shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
