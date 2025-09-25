'use client';

import { motion } from 'framer-motion';
import { Sun, Battery, Zap, Check } from 'lucide-react';
import useStore, { SolutionType } from '@/store/useStore';

const SolutionChooser = () => {
  const { selectedSolution, setSelectedSolution } = useStore();

  const solutions = [
    {
      type: 'solar' as SolutionType,
      title: 'Solar Only',
      price: 'From $4,990',
      icon: Sun,
      features: [
        'High-efficiency solar panels',
        'Professional installation included',
        '25-year manufacturer warranty',
        'Reduce electricity bills up to 80%'
      ],
      popular: false,
    },
    {
      type: 'battery' as SolutionType,
      title: 'Battery Only',
      price: 'From $8,990',
      icon: Battery,
      features: [
        'Premium lithium battery storage',
        'Smart energy management system',
        '10-year performance warranty',
        'Backup power during outages'
      ],
      popular: false,
    },
    {
      type: 'solar-battery' as SolutionType,
      title: 'Solar + Battery',
      price: 'From $12,990',
      icon: Zap,
      features: [
        'Complete energy independence',
        'Maximum savings potential',
        'Full backup power solution',
        'Future-proof your home'
      ],
      popular: true,
    },
  ];

  const handleSolutionSelect = (solution: SolutionType) => {
    setSelectedSolution(solution);
  };

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Choose Your Solution
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Select the perfect energy solution for your home and start saving today
          </p>
        </motion.div>

        {/* Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            const isSelected = selectedSolution === solution.type;
            
            return (
              <motion.div
                key={solution.type}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 cursor-pointer border-2 ${
                  isSelected
                    ? 'border-primary shadow-primary/20 scale-105'
                    : 'border-gray-100 hover:border-primary/30'
                } ${solution.popular ? 'ring-2 ring-accent ring-opacity-50' : ''}`}
                onClick={() => handleSolutionSelect(solution.type)}
              >
                {/* Popular Badge */}
                {solution.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-text-primary px-6 py-2 rounded-full text-sm font-bold shadow-lg"
                  >
                    MOST POPULAR
                  </motion.div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-surface text-primary'
                    } transition-all duration-300`}
                  >
                    <IconComponent size={36} />
                  </motion.div>
                </div>

                {/* Title and Price */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-3xl font-bold text-primary mb-1">
                    {solution.price}
                  </p>
                  <p className="text-sm text-text-muted">
                    Including installation
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {solution.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 + featureIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-text-secondary text-sm leading-relaxed">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Select Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 px-6 rounded-full font-bold transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-text-primary hover:bg-primary hover:text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSolutionSelect(solution.type);
                  }}
                >
                  {isSelected ? 'SELECTED' : 'SELECT THIS PLAN'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-4"
        >
          <p className="text-text-muted">
            All prices include GST and professional installation
          </p>
          <p className="text-sm text-text-muted">
            * Final pricing may vary based on your specific requirements and location
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionChooser;