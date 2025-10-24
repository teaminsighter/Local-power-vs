"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroImage } from '@/components/ui/optimized-image-advanced';

interface HeroProps {
  onOpenCalculator?: () => void;
}

export function Hero({ onOpenCalculator }: HeroProps) {
  const scrollToQuote = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
  };

  return (
    <section ref={heroRef} className="relative w-full h-screen min-h-[600px] flex items-center text-white overflow-hidden" id="hero">
      <motion.div style={{ scale: imageScale }} className="absolute inset-0">
        <HeroImage
          src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Flocalpower-hero-fmaily.webp?alt=media&token=fb696a49-effa-4c81-b25c-040ed52bb262"
          alt="Solar panels on a residential roof with a happy family in the foreground"
          className="object-cover object-right sm:object-center"
          priority={true}
          quality={90}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 from-0% via-primary/60 via-40% sm:via-50% to-transparent to-70% sm:to-80%" />
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div 
          className="flex flex-col justify-center space-y-6 sm:space-y-8 max-w-full sm:max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight !text-white break-words"
            style={{ color: '#ffffff' }}
            variants={itemVariants}
            id="hero-title"
          >
            Solar Panels for Your Home in Dublin
          </motion.h1>
          <motion.p 
            className="max-w-full sm:max-w-[600px] text-base sm:text-lg md:text-xl text-primary-foreground/90 leading-relaxed"
            variants={itemVariants}
            id="hero-subtitle"
          >
            Slash your energy bills and go green—claim your €1,800 grant before it drops!
          </motion.p>
          <motion.ul className="space-y-3 sm:space-y-4 pt-2" variants={itemVariants} id="hero-benefits-list">
            {[
              "Save up to 70% on household energy bills",
              "€1,800 SEAI grant & 0% VAT",
              "30-year Solarwatt panel warranty",
              "Fast, local, SEAI-certified installation"
            ].map((benefit) => (
              <motion.li key={benefit} className="flex items-start gap-3" variants={itemVariants}>
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-base sm:text-lg font-medium leading-snug">{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2" variants={itemVariants}>
              {onOpenCalculator && (
                <Button onClick={onOpenCalculator} size="lg" className="font-bold text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-black border-0 shadow-lg cta-button w-full sm:w-auto py-3 px-6" id="hero-cta-calculator">
                    Check My Savings
                </Button>
              )}
              <Button onClick={scrollToQuote} size="lg" className="font-bold text-sm sm:text-base text-white shadow-lg cta-button w-full sm:w-auto py-3 px-6" style={{backgroundColor: '#166b48'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e38'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166b48'} id="hero-cta-quote">
                  Request Free Quote
              </Button>
          </motion.div>
          <motion.div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-primary-foreground/80 pt-3 sm:pt-4" variants={itemVariants} id="hero-tags">
              <span className="font-semibold">SEAI Registered</span>
              <span className="text-accent hidden sm:inline-block">|</span>
              <span className="font-semibold">Solarwatt Official Partner</span>
              <span className="text-accent hidden sm:inline-block">|</span>
              <span className="font-semibold">30-Year Warranty</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
