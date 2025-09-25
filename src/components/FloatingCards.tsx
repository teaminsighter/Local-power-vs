'use client';

import { motion } from 'framer-motion';
import { Euro, Shield, Zap } from 'lucide-react';

const FloatingCards = () => {
  const cards = [
    {
      icon: Euro,
      title: 'Save €2,000+ annually',
      subtitle: 'Reduce your electricity bills',
      delay: 0,
      y: 0,
    },
    {
      icon: Shield,
      title: 'Government grants available',
      subtitle: 'Up to €2,400 SEAI grant',
      delay: 0.2,
      y: 20,
    },
    {
      icon: Zap,
      title: 'Zero upfront cost options',
      subtitle: 'Flexible payment plans',
      delay: 0.4,
      y: -10,
    },
  ];

  return (
    <div className="relative">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: card.y, x: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: card.delay,
              type: 'spring',
              damping: 20,
              stiffness: 100
            }}
            className={`absolute ${
              index === 0 ? 'top-0 right-0' : 
              index === 1 ? 'top-20 right-8' : 
              'top-40 right-4'
            }`}
            style={{
              animation: `float${index + 1} 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 min-w-[280px] border border-white/20"
            >
              <div className="flex items-start space-x-4">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <IconComponent className="text-primary" size={24} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary text-lg leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-text-muted text-sm mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Solar Panel Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-80 h-60 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl border-4 border-primary/20 shadow-2xl"
        >
          {/* Solar Panel Grid */}
          <div className="grid grid-cols-4 gap-2 p-4 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="bg-primary/30 rounded-lg border border-primary/40"
              />
            ))}
          </div>
          
          {/* Shine Effect */}
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.2) 40%, transparent 60%)',
                'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 60%, transparent 80%)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl"
          />
        </motion.div>

        {/* Floating Energy Icons */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 -left-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg"
        >
          ⚡
        </motion.div>
        
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute -bottom-4 -right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg"
        >
          ☀️
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(2px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(-3px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-6px) translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default FloatingCards;