"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sun, Battery, Calculator, TrendingUp, CheckCircle, TrendingDown, Eye, Leaf } from 'lucide-react';

interface SolarSavingsSectionProps {
  onOpenCalculator?: () => void;
}

export function SolarSavingsSection({ onOpenCalculator }: SolarSavingsSectionProps) {
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

  const benefits = [
    {
      icon: TrendingDown,
      title: "Know",
      subtitle: "how much your monthly bill can drop"
    },
    {
      icon: Eye,
      title: "See",
      subtitle: "your new bill after solar"
    },
    {
      icon: Leaf,
      title: "Find out",
      subtitle: "your annual CO₂ savings and long-term returns"
    }
  ];

  const features = [
    {
      icon: Sun,
      text: "How much sunlight and temperature your roof receives throughout the year."
    },
    {
      icon: Battery,
      text: "How many panels and what battery size fit your home and usage."
    },
    {
      icon: Calculator,
      text: "How much power your system can generate and how much money you'll save."
    },
    {
      icon: TrendingUp,
      text: "Your payback period — when your system fully covers its cost."
    },
    {
      icon: CheckCircle,
      text: "Your projected savings over 25+ years, including future tariff changes and energy trends."
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-gray-900">
              Why Check Your Solar Savings?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Get instant, personalized insights into your solar potential
            </p>
            
            {/* Three Benefits - Enhanced Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100 mx-auto mb-6 group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300">
                      <benefit.icon className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold leading-tight">
                        <span className="text-green-600 text-3xl">{benefit.title}</span>
                        <br />
                        <span className="text-gray-800 text-xl">{benefit.subtitle}</span>
                      </h3>
                    </div>
                    {/* Subtle accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p 
              className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              variants={itemVariants}
            >
              Tell us about your energy use — and we'll calculate everything for you.
            </motion.p>
          </motion.div>

          {/* DIY Solar Assessment Tool Section */}
          <motion.div className="mb-16" variants={itemVariants}>
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Our DIY Solar Assessment Tool
              </h3>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                More than just savings — we help you design the perfect system for your home
              </p>
              <div className="inline-flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-full font-semibold text-lg border border-green-200">
                <Eye className="h-5 w-5 mr-2" />
                Here's what you'll discover:
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02]"
                  variants={itemVariants}
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                    scale: 1.02
                  }}
                  style={{
                    backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.05) 100%)"
                  }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-white/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 mx-auto mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg">
                      <feature.icon className="h-10 w-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                    </div>
                    <p className="text-gray-800 font-semibold text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      {feature.text}
                    </p>
                    
                    {/* Subtle accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0"></div>
                  </div>
                  
                  {/* Corner accent */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Math-Based Decision Section */}
          <motion.div 
            className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-50 rounded-3xl p-10 max-w-5xl mx-auto mb-16 border border-green-100 shadow-xl"
            variants={itemVariants}
          >
            <div className="absolute top-6 right-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">
                  Math-Based Decisions, Not Guesswork
                </h4>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-lg font-semibold text-green-700 mb-4 leading-relaxed">
                    Switching to solar should be a math-based decision, not a guess.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Our calculator analyses your past 12 months of kWh use, your day/night or EV tariff, and your supplier's 
                    CEG export rate to create a clear, personal savings model.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                    <div className="text-gray-600 font-medium">Personalized Analysis</div>
                    <div className="mt-4 text-sm text-gray-500">
                      Based on your actual energy usage patterns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced CTA Button */}
          <motion.div className="text-center" variants={itemVariants}>
            {onOpenCalculator && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <Button 
                  onClick={onOpenCalculator} 
                  size="lg" 
                  className="relative font-bold text-xl px-12 py-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black border-0 shadow-2xl rounded-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Calculator className="h-6 w-6 mr-3" />
                  Check My Savings Now
                  <TrendingUp className="h-6 w-6 ml-3" />
                </Button>
                <p className="mt-4 text-gray-600 font-medium">
                  ⚡ Get your personalized report in under 2 minutes
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}