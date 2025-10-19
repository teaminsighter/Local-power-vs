"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Settings, Plug, Clock, DollarSign } from 'lucide-react';

export function MixedBrandProblemsV2() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    },
  };

  const problems = [
    {
      icon: FileText,
      title: "Confusing Warranties",
      description: "Different vendors mean different contracts. When something fails, each brand points fingers — and you're left paying.",
      accent: "from-red-400 to-red-600"
    },
    {
      icon: Settings,
      title: "Poor System Performance", 
      description: "Inverters and panels that weren't designed together can misread power, lowering generation and stretching your payback period.",
      accent: "from-orange-400 to-orange-600"
    },
    {
      icon: Plug,
      title: "Tech That Doesn't Talk",
      description: "Mixed-brand apps lose smart-charging data and consumption tracking — you can't see or prove your savings clearly.",
      accent: "from-purple-400 to-purple-600"
    },
    {
      icon: Clock,
      title: "Downtime & Delays",
      description: "When an issue hits, vendors wait on each other. Your system sits idle while your savings disappear.",
      accent: "from-blue-400 to-blue-600"
    },
    {
      icon: DollarSign,
      title: "Hidden Costs Later",
      description: "Unsupported combinations void warranties and rack up service fees. What looked \"cheaper\" ends up costing more.",
      accent: "from-pink-400 to-pink-600"
    }
  ];

  return (
    <section 
      className="w-full py-16 md:py-24 relative overflow-hidden"
      style={{ backgroundColor: '#166b48' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-white/20 rounded-full blur-2xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <span className="inline-block px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-full mb-6">
              Featured
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Unrivaled home solar<br />
              and battery experience
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Don't get stuck with mixed-brand problems. Our unified system eliminates the headaches.
            </p>
          </motion.div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Large card - spans 2 columns on large screens */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${problems[0].accent} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {React.createElement(problems[0].icon, { className: "h-8 w-8 text-white" })}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{problems[0].title}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{problems[0].description}</p>
                </div>
              </div>
            </motion.div>

            {/* Regular card */}
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${problems[1].accent} shadow-lg mb-4 inline-block group-hover:scale-110 transition-transform duration-300`}>
                {React.createElement(problems[1].icon, { className: "h-6 w-6 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{problems[1].title}</h3>
              <p className="text-gray-700 leading-relaxed">{problems[1].description}</p>
            </motion.div>

            {/* Regular card */}
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${problems[2].accent} shadow-lg mb-4 inline-block group-hover:scale-110 transition-transform duration-300`}>
                {React.createElement(problems[2].icon, { className: "h-6 w-6 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{problems[2].title}</h3>
              <p className="text-gray-700 leading-relaxed">{problems[2].description}</p>
            </motion.div>

            {/* Regular card */}
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${problems[3].accent} shadow-lg mb-4 inline-block group-hover:scale-110 transition-transform duration-300`}>
                {React.createElement(problems[3].icon, { className: "h-6 w-6 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{problems[3].title}</h3>
              <p className="text-gray-700 leading-relaxed">{problems[3].description}</p>
            </motion.div>

            {/* Large card - spans 2 columns on large screens */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${problems[4].accent} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {React.createElement(problems[4].icon, { className: "h-8 w-8 text-white" })}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{problems[4].title}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{problems[4].description}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div className="text-center mt-16" variants={itemVariants}>
            <button 
              className="text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              Avoid These Problems with Solarwatt
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}