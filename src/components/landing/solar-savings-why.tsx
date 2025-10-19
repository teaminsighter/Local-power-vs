"use client";

import { motion } from 'framer-motion';
import { TrendingDown, Eye, Leaf } from 'lucide-react';

export function SolarSavingsWhy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const benefits = [
    {
      icon: TrendingDown,
      title: "Know",
      subtitle: "how much your monthly bill can drop",
      description: "Get precise calculations based on your actual energy usage and see the immediate impact on your monthly electricity costs."
    },
    {
      icon: Eye,
      title: "See",
      subtitle: "your new bill after solar",
      description: "Visualize exactly what your electricity bill will look like with solar panels, including seasonal variations and energy export credits."
    },
    {
      icon: Leaf,
      title: "Find out",
      subtitle: "your annual CO₂ savings and long-term returns",
      description: "Discover your environmental impact with precise CO₂ reduction calculations and understand your investment returns over 25+ years."
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Check Your Solar Savings?
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
              Tell us about your energy use — and we'll calculate everything for you.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            variants={containerVariants}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
                variants={itemVariants}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    <span className="text-primary">{benefit.title}</span>{" "}
                    <span className="text-gray-900">{benefit.subtitle}</span>
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}