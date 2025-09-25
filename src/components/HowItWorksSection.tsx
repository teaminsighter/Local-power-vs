'use client';

import { motion } from 'framer-motion';
import { MapPin, Home, Calculator, Zap, FileText, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: MapPin,
      title: 'Location',
      description: 'Select your location to see available grants and rebates',
      color: 'bg-blue-500'
    },
    {
      icon: Home,
      title: 'Property Details',
      description: 'Tell us about your property and roof type',
      color: 'bg-green-500'
    },
    {
      icon: Calculator,
      title: 'Energy Usage',
      description: 'Share your current electricity consumption',
      color: 'bg-purple-500'
    },
    {
      icon: Zap,
      title: 'Choose Solution',
      description: 'Pick the perfect solar and battery system',
      color: 'bg-yellow-500'
    },
    {
      icon: FileText,
      title: 'Contact Info',
      description: 'Provide your details for personalized service',
      color: 'bg-red-500'
    },
    {
      icon: CheckCircle,
      title: 'Get Quote',
      description: 'Receive your customized quote instantly',
      color: 'bg-primary'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            How It Works
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Get your personalized solar quote in just 6 simple steps. 
            Our streamlined process makes going solar easier than ever.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <IconComponent size={28} className="text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  {step.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent transform -translate-y-1/2" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Your Solar Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;