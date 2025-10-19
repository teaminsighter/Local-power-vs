"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroProps {
  onOpenCalculator?: () => void;
}

export function HeroV3({ onOpenCalculator }: HeroProps) {
  const scrollToQuote = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

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
      y: 0
    },
  };

  return (
    <section ref={heroRef} className="relative w-full h-screen flex items-center text-white overflow-hidden" id="hero">
      {/* Background Image */}
      <motion.div style={{ scale: imageScale }} className="absolute inset-0">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Flocalpower-hero-fmaily.webp?alt=media&token=fb696a49-effa-4c81-b25c-040ed52bb262"
          alt="Solar panels on a residential roof with a happy family in the foreground"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-700/40" />
      
      {/* Hero Content */}
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full h-full flex items-start"
      >
        <div className="w-full pl-4 md:pl-8 lg:pl-12">
          <motion.div 
            className="flex flex-col justify-start max-w-2xl pt-28 md:pt-32 lg:pt-36"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* Subtitle above title - Single row */}
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-4 whitespace-nowrap"
              variants={itemVariants}
              id="hero-subtitle"
            >
              Go Green with The Most Advanced Solar System You'll Ever See
            </motion.p>

            {/* Main Heading - Two rows with minimum line height */}
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-6xl font-bold leading-none mb-8 text-white"
              variants={itemVariants}
              id="hero-title"
            >
              See How Much You'll Save With Solar<br />
              and Help Power Ireland's Cleaner Future
            </motion.h1>

            {/* CTA Button - Left aligned */}
            <motion.div className="mb-6 flex justify-start" variants={itemVariants}>
              <Button 
                onClick={onOpenCalculator} 
                size="lg" 
                className="font-semibold text-lg px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg transition-all duration-300"
                id="hero-main-cta"
              >
                Check My Savings
              </Button>
            </motion.div>

            {/* Trust Indicators - Single row without scrollbar */}
            <motion.div 
              className="flex items-center gap-x-4 text-sm text-white/80 mb-12 whitespace-nowrap" 
              variants={itemVariants} 
              id="hero-tags"
            >
              <span className="font-semibold">SEAI Registered</span>
              <span className="text-white/60">|</span>
              <span className="font-semibold">Solarwatt Official Partner</span>
              <span className="text-white/60">|</span>
              <span className="font-semibold">30-Year Warranty</span>
              <span className="text-white/60">|</span>
              <span className="font-semibold">18+ MW installed</span>
              <span className="text-white/60">|</span>
              <span className="font-semibold">1,600,000+ tonnes of CO₂e saved</span>
            </motion.div>
          </motion.div>
        </div>

      </motion.div>
      
      {/* Stats Section with White Curved Cutout - Bottom Left Corner */}
      <motion.div 
        className="absolute bottom-0 left-0 z-20"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white text-slate-900 rounded-tr-[120px] p-6 md:p-8 lg:p-10 shadow-2xl w-[568px] md:w-[649px] lg:w-[770px] h-[120px] md:h-[140px] lg:h-[160px] flex flex-col justify-center">
          {/* Client Section Only */}
          <div>
            <p className="text-lg font-semibold text-green-600 mb-4 text-center">Our clients include</p>
            <div className="overflow-hidden">
              <motion.div
                className="flex items-center gap-8"
                animate={{
                  x: [0, -300],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Image
                  src="/logos/footer_badge_forover30years.svg"
                  alt="30+ Years Experience"
                  width={100}
                  height={50}
                  className="opacity-80"
                />
                <Image
                  src="/logos/Website_Siegel 1-705x397.webp"
                  alt="Certificate Siegel"
                  width={120}
                  height={60}
                  className="opacity-80"
                />
                <Image
                  src="/logos/footer_badge_forover30years.svg"
                  alt="30+ Years Experience"
                  width={100}
                  height={50}
                  className="opacity-80"
                />
                <Image
                  src="/logos/Website_Siegel 1-705x397.webp"
                  alt="Certificate Siegel"
                  width={120}
                  height={60}
                  className="opacity-80"
                />
                <Image
                  src="/logos/footer_badge_forover30years.svg"
                  alt="30+ Years Experience"
                  width={100}
                  height={50}
                  className="opacity-80"
                />
                <div className="w-[100px] h-[50px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">ESB</div>
                </div>
                <div className="w-[120px] h-[60px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-xl font-bold text-green-600">Bord Gáis</div>
                </div>
                <div className="w-[100px] h-[50px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-orange-600">Electric Ireland</div>
                </div>
                <div className="w-[120px] h-[60px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-purple-600">Energia</div>
                </div>
                <div className="w-[100px] h-[50px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-lg font-bold text-red-600">SSE Airtricity</div>
                </div>
                <div className="w-[120px] h-[60px] bg-white rounded-md flex items-center justify-center shadow-sm border border-gray-200">
                  <div className="text-xl font-bold text-teal-600">Panda Power</div>
                </div>
                <Image
                  src="/logos/footer_badge_forover30years.svg"
                  alt="30+ Years Experience"
                  width={100}
                  height={50}
                  className="opacity-80"
                />
                <Image
                  src="/logos/Website_Siegel 1-705x397.webp"
                  alt="Certificate Siegel"
                  width={120}
                  height={60}
                  className="opacity-80"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}