'use client';

import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';
import FloatingCards from './FloatingCards';
import AnimatedCounter from './AnimatedCounter';

interface HeroSectionProps {
  onGetQuoteClick?: () => void;
}

const HeroSection = ({ onGetQuoteClick }: HeroSectionProps) => {
  const handleCallClick = () => {
    window.open('tel:+353123456789', '_self');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/353123456789', '_blank');
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-surface via-white to-surface overflow-hidden pt-16">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-10 w-32 h-32 border-4 border-primary transform rotate-45"
        />
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-40 right-20 w-24 h-24 border-3 border-accent rounded-full"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -20 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary/10 transform rotate-12"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-[calc(100vh-200px)]">
          {/* LEFT SIDE - 60% width (3/5 columns) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Main Headlines */}
            <div className="space-y-6">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary leading-tight"
              >
                <span className="text-primary">Local Power</span>
              </motion.h1>

              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-secondary"
              >
                Solar + Battery
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-primary font-medium"
              >
                Your complete energy solution tool
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg text-text-muted leading-relaxed max-w-2xl"
            >
              Discover how much you can save with solar panels and battery storage. 
              Take advantage of SEAI grants and government incentives to reduce your electricity bills 
              and achieve energy independence for your Irish home.
            </motion.p>

            {/* Savings Counter */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/10"
            >
              <p className="text-sm text-text-muted mb-2">Potential Annual Savings</p>
              <p className="text-3xl font-bold text-primary">
                €<AnimatedCounter end={2400} duration={2} />
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                onClick={onGetQuoteClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
              >
                Get Your Quote
              </motion.button>
              
              <motion.button
                onClick={handleCallClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <Phone size={20} />
                Call Us
              </motion.button>

              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <MessageCircle size={20} />
                WhatsApp
              </motion.button>
            </motion.div>

            {/* Phone Number & Business Hours */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="space-y-2"
            >
              <p className="text-2xl font-bold text-primary">+353 1 234 5678</p>
              <p className="text-sm text-text-muted">Mon-Fri 9am-6pm • Free consultation</p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {[
                { text: 'SEAI Registered', icon: '🛡️' },
                { text: '25 Year Warranty', icon: '⭐' },
                { text: 'Irish Owned', icon: '🍀' }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-primary/10"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-text-primary">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT SIDE - 40% width (2/5 columns) */}
          <div className="lg:col-span-2 relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative h-96 lg:h-full min-h-[500px]"
            >
              <FloatingCards />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Ambient Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-8 text-4xl opacity-20"
      >
        ⚡
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-8 text-3xl opacity-20"
      >
        🏠
      </motion.div>
    </section>
  );
};

export default HeroSection;