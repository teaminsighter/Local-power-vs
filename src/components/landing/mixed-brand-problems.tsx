"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Plug, Clock, DollarSign } from 'lucide-react';

export function MixedBrandProblems() {
  const scrollToQuote = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const problems = [
    {
      icon: FileText,
      emoji: "🧾",
      title: "Confusing Warranties",
      description: "Different vendors mean different contracts. When something fails, each brand points fingers — and you're left paying."
    },
    {
      icon: Settings,
      emoji: "⚙️",
      title: "Poor System Performance",
      description: "Inverters and panels that weren't designed together can misread power, lowering generation and stretching your payback period."
    },
    {
      icon: Plug,
      emoji: "🔌",
      title: "Tech That Doesn't Talk",
      description: "Mixed-brand apps lose smart-charging data and consumption tracking — you can't see or prove your savings clearly."
    },
    {
      icon: Clock,
      emoji: "🕒",
      title: "Downtime & Delays",
      description: "When an issue hits, vendors wait on each other. Your system sits idle while your savings disappear."
    },
    {
      icon: DollarSign,
      emoji: "💸",
      title: "Hidden Costs Later",
      description: "Unsupported combinations void warranties and rack up service fees. What looked \"cheaper\" ends up costing more."
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Most Solar Companies Mix Components From Different Vendors Just to Cut Costs, Leaving You With Compatibility Issues and Zero Accountability
            </h2>
          </motion.div>

          {/* Problems Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-12"
            variants={containerVariants}
          >
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-5 lg:p-7 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-gray-300 h-full transform scale-[1.2]"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.25 }}
              >
                {index % 2 === 0 ? (
                  // Odd cards (1st, 3rd, 5th): Icon first, then title
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="text-3xl">{problem.emoji}</div>
                    </div>
                    <h3 className="text-sm lg:text-base font-bold mb-2 lg:mb-3" style={{color: '#166b48'}}>
                      {problem.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                      {problem.description}
                    </p>
                  </>
                ) : (
                  // Even cards (2nd, 4th): Title first, then icon
                  <>
                    <h3 className="text-sm lg:text-base font-bold mb-2 lg:mb-3" style={{color: '#166b48'}}>
                      {problem.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed mb-4">
                      {problem.description}
                    </p>
                    <div className="flex justify-center">
                      <div className="text-3xl">{problem.emoji}</div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>


          {/* CTA */}
          <motion.div className="text-center" variants={itemVariants}>
            <Button 
              onClick={scrollToQuote}
              size="lg" 
              className="font-bold text-lg px-8 py-4 text-white shadow-lg"
              style={{backgroundColor: '#166b48'}} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e38'} 
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166b48'}
            >
              Check My Savings
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}