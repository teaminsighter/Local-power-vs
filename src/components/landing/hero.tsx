"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroProps {
  onOpenCalculator?: () => void;
}

export function Hero({ onOpenCalculator }: HeroProps) {
  const scrollToQuote = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const scrollToConsultation = () => {
    document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <section ref={heroRef} className="relative w-full h-[90vh] min-h-[600px] flex items-center text-white overflow-hidden" id="hero">
      <motion.div style={{ scale: imageScale }} className="absolute inset-0">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Flocalpower-hero-fmaily.webp?alt=media&token=fb696a49-effa-4c81-b25c-040ed52bb262"
          alt="Solar panels on a residential roof with a happy family in the foreground"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary from-0% via-primary/70 via-50% to-transparent to-75%" />
      <motion.div 
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 container px-4 md:px-6"
      >
        <motion.div 
          className="flex flex-col justify-center space-y-8 max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl !text-white"
            style={{ color: '#ffffff' }}
            variants={itemVariants}
            id="hero-title"
          >
            Solar Panels for Your Home in Dublin
          </motion.h1>
          <motion.p 
            className="max-w-[600px] text-lg md:text-xl text-primary-foreground/90"
            variants={itemVariants}
            id="hero-subtitle"
          >
            Slash your energy bills and go green—claim your €1,800 grant before it drops!
          </motion.p>
          <motion.ul className="space-y-4 pt-2" variants={itemVariants} id="hero-benefits-list">
            {[
              "Save up to 70% on household energy bills",
              "€1,800 SEAI grant & 0% VAT",
              "30-year Solarwatt panel warranty",
              "Fast, local, SEAI-certified installation"
            ].map((benefit) => (
              <motion.li key={benefit} className="flex items-center gap-3" variants={itemVariants}>
                <CheckCircle className="h-7 w-7 text-accent" />
                <span className="text-lg font-medium">{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
              <Button onClick={scrollToQuote} size="lg" className="font-bold text-base bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg cta-button" id="hero-cta-quote">
                  Request Free Quote
              </Button>
              <Button onClick={scrollToConsultation} size="lg" variant="outline" className="font-bold text-base bg-transparent border-white text-white hover:bg-white hover:text-primary shadow-lg cta-button" id="hero-cta-consultation">
                  Book Free Consultation
              </Button>
              {onOpenCalculator && (
                <Button onClick={onOpenCalculator} size="lg" variant="secondary" className="font-bold text-base bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg cta-button" id="hero-cta-calculator">
                    Check My Savings
                </Button>
              )}
          </motion.div>
          <motion.div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-primary-foreground/80 pt-4" variants={itemVariants} id="hero-tags">
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
