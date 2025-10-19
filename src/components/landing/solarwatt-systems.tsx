"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap } from 'lucide-react';

export function SolarwattSystems() {
  const [hoveredCard, setHoveredCard] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of image paths
  const images = [
    '/lc1.jpeg',
    '/lc2.jpeg', 
    '/lc3.jpeg',
    '/lc4.jpeg',
    '/lc5.jpeg',
    '/lc6.jpeg',
    '/lc7.jpeg'
  ];

  // Auto-cycle through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  // Combined features: 8 features merged into 4 cards
  const combinedFeatures = [
    {
      title: "Financial Benefits & Long-term Security",
      subtitle: "",
      description: "Fast, clear ROI: SEAI grant up to €1,800 + 0% upfront finance packaged for premium, worry-free ownership.\n30-year certainty: German glass–glass panels with 30-year product & performance guarantee.",
      gradient: "from-green-500 to-amber-500",
      image: {
        icon: "💰",
        title: "Smart Investment",
        description: "Maximum financial benefits with long-term security"
      }
    },
    {
      title: "German Excellence & Durability",
      subtitle: "",
      description: "Proven pedigree: 100% German-made, part of the BMW e-mobility ecosystem since 2013.\nLifetime durability: True glass–glass build resists UV, moisture, microcracks; ≥90% output after 30 years.",
      gradient: "from-purple-500 to-orange-500",
      image: {
        icon: "🚗",
        title: "Premium Engineering",
        description: "BMW-grade German engineering and durability"
      }
    },
    {
      title: "Performance & Weather Resilience",
      subtitle: "",
      description: "Low-light advantage: Ultra-sensitive modules generate a trickle even under moonlight.\nBuilt for Ireland: Certified for hail (25 mm @ 23 m/s), salt mist, −40°C to +85°C extremes.",
      gradient: "from-indigo-500 to-cyan-500",
      image: {
        icon: "🌙",
        title: "All-Weather Performance",
        description: "Works in any Irish weather condition"
      }
    },
    {
      title: "Safety & Instant Backup",
      subtitle: "",
      description: "Safety you can cite: Certified EN IEC 62619, VDE-AR-E 2510-50, UN 38.3, CE/UKCA, EU 2023/1542.\nStorm-proof calm: 20 ms switchover keeps lights, Wi-Fi, and fridge alive during outages.",
      gradient: "from-emerald-500 to-rose-500",
      image: {
        icon: "⚡",
        title: "Complete Protection",
        description: "Safety certified with instant backup power"
      }
    }
  ];


  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
              German-Engineered Solarwatt Systems
            </h2>
            <p className="text-xl md:text-2xl font-bold text-green-600 mb-3">
              One Brand, One Warranty, Zero Headaches
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              All major components: panels, inverter, battery, and software are designed and supplied by one brand: Solarwatt. No third-party compatibility issues or multiple warranties.
            </p>
          </motion.div>

          {/* 4 Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {combinedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-500 transform cursor-pointer h-full ${
                  hoveredCard === index 
                    ? 'scale-110 z-20 shadow-2xl -translate-y-4' 
                    : 'hover:scale-105 hover:-translate-y-2 hover:shadow-xl'
                }`}
                variants={itemVariants}
                onMouseEnter={() => setHoveredCard(index)}
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                }}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <h4 className={`text-base font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-4`}>
                    {feature.subtitle}
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                    {feature.description.split('\n').map((line, index) => (
                      <p key={index} className={index > 0 ? 'mt-3' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Corner Accent */}
                <div className={`absolute top-3 right-3 w-3 h-3 bg-gradient-to-br ${feature.gradient} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300`}></div>
                
                {/* Bottom Accent Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
              </motion.div>
            ))}
          </div>

          {/* Auto-cycling Image Carousel */}
          <div className="flex justify-center mt-36 max-w-4xl mx-auto">
            <div className="w-full h-96 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`Solar system image ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.56 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="max-w-full max-h-full object-contain"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Call to Action */}
          <motion.div className="text-center mt-12" variants={itemVariants}>
            <div className="relative inline-block">
              <button 
                className="relative text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{backgroundColor: '#166b48'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e38'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166b48'}
              >
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Get Free Quote
                  <Zap className="h-5 w-5" />
                </span>
              </button>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              🇩🇪 Premium German engineering meets Irish weather conditions
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}