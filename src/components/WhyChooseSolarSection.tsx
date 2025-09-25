'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Shield, Leaf, Zap, Home, Euro } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const WhyChooseSolarSection = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: 'Reduce Energy Bills',
      description: 'Save up to 80% on your electricity bills with solar power',
      stat: '80%',
      statLabel: 'Bill Reduction'
    },
    {
      icon: Shield,
      title: 'Government Grants',
      description: 'SEAI grants of up to €2,400 available for solar installations',
      stat: '€2,400',
      statLabel: 'SEAI Grant'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'Reduce your carbon footprint and help protect the environment',
      stat: '4.5',
      statLabel: 'Tonnes CO₂ Saved/Year'
    },
    {
      icon: Zap,
      title: 'Energy Independence',
      description: 'Generate your own clean energy and reduce grid dependency',
      stat: '100%',
      statLabel: 'Clean Energy'
    },
    {
      icon: Home,
      title: 'Increase Home Value',
      description: 'Solar installations can increase your property value by up to 4%',
      stat: '4%',
      statLabel: 'Value Increase'
    },
    {
      icon: Euro,
      title: 'Long-term Savings',
      description: 'With 25-year warranties, enjoy decades of free electricity',
      stat: '25',
      statLabel: 'Year Warranty'
    }
  ];

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
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Why Choose Solar?
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Join thousands of Irish homeowners who are already saving money 
            and reducing their environmental impact with solar energy.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6"
                >
                  <IconComponent size={28} className="text-primary" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  {benefit.title}
                </h3>
                <p className="text-text-muted leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Statistic */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {benefit.stat.includes('€') || benefit.stat.includes('%') ? (
                      benefit.stat
                    ) : (
                      <AnimatedCounter end={parseInt(benefit.stat)} duration={2} />
                    )}
                  </div>
                  <div className="text-sm text-text-muted">
                    {benefit.statLabel}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-white/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={10000} duration={3} suffix="+" />
              </div>
              <div className="text-text-muted">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={25} duration={2.5} />
              </div>
              <div className="text-text-muted">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                €<AnimatedCounter end={50} duration={2} suffix="M+" />
              </div>
              <div className="text-text-muted">Savings Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={500} duration={2.5} suffix="+" />
              </div>
              <div className="text-text-muted">Tonnes CO₂ Saved</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSolarSection;