'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Wrench, Clock } from 'lucide-react';

const CTASection = () => {
  const trustBadges = [
    {
      icon: Shield,
      title: 'No Obligation',
      description: 'Free quote with no commitment required'
    },
    {
      icon: Users,
      title: 'Free Consultation',
      description: 'Expert advice tailored to your needs'
    },
    {
      icon: Wrench,
      title: 'Professional Installation',
      description: 'Certified technicians and quality guarantee'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Ongoing support and maintenance'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white transform rotate-45"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Save on Energy?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Get your personalized solar quote in minutes and start your journey to energy independence
          </p>
          
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            viewport={{ once: true }}
            className="bg-accent hover:bg-accent-dark text-text-primary font-bold py-6 px-12 rounded-full text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl mb-4"
          >
            Get My Free Quote
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-white/80 text-sm"
          >
            Takes less than 2 minutes • No spam, ever
          </motion.p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {trustBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <IconComponent size={28} className="text-white" />
                </motion.div>
                
                <h3 className="text-lg font-bold text-white mb-2">
                  {badge.title}
                </h3>
                
                <p className="text-white/80 text-sm">
                  {badge.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Trust Elements */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-4"
        >
          <div className="flex justify-center items-center space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm">Licensed & Insured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm">Clean Energy Council Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm">10,000+ Happy Customers</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-8 text-4xl opacity-20"
      >
        ⚡
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-8 text-3xl opacity-20"
      >
        🏠
      </motion.div>
    </section>
  );
};

export default CTASection;