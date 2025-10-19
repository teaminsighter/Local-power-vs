"use client";

import { motion } from 'framer-motion';
import { Sun, Battery, Calculator, TrendingUp, CheckCircle } from 'lucide-react';

export function SolarAssessmentTool() {
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

  const features = [
    {
      icon: Sun,
      text: "How much sunlight and temperature your roof receives throughout the year."
    },
    {
      icon: Battery,
      text: "How many panels and what battery size fit your home and usage."
    },
    {
      icon: Calculator,
      text: "How much power your system can generate and how much money you'll save."
    },
    {
      icon: TrendingUp,
      text: "Your payback period — when your system fully covers its cost."
    },
    {
      icon: CheckCircle,
      text: "Your projected savings over 25+ years, including future tariff changes and energy trends."
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Our DIY Solar Assessment Tool
            </h2>
            <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
              Our DIY Solar Assessment Tool does more than show savings — it helps you design the perfect system for your home.
            </p>
          </motion.div>

          <motion.div className="mb-8" variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-8">You'll see:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
                  variants={itemVariants}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {feature.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-primary/5 rounded-2xl p-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <div className="space-y-4 text-gray-700">
              <p className="text-lg font-semibold text-primary">
                Switching to solar should be a math-based decision, not a guess.
              </p>
              <p className="leading-relaxed">
                Our calculator analyses your past 12 months of kWh use, your day/night or EV tariff, and your supplier's 
                CEG export rate to create a clear, personal savings model — so you know exactly how solar will work for 
                your home.
              </p>
            </div>
          </motion.div>

          <motion.div className="text-center mt-12" variants={itemVariants}>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Source: <a href="https://localpower.ie/smart-solar-power/" className="text-primary hover:underline">https://localpower.ie/smart-solar-power/</a><br/>
              <a href="https://localpower.ie/ev-charging/" className="text-primary hover:underline">https://localpower.ie/ev-charging/</a><br/>
              Our clients include: <a href="https://localpower.ie/" className="text-primary hover:underline">https://localpower.ie/</a> includes client profile
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}