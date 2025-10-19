"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Shield, FlaskConical } from 'lucide-react';

export function ProofSection() {
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

  const videos = [
    {
      id: "HwOqAL9SOpY",
      title: "Heat Resistance Test | Lab Testing | SOLARWATT UK & Ireland",
      thumbnail: `https://img.youtube.com/vi/HwOqAL9SOpY/maxresdefault.jpg`
    },
    {
      id: "mrJ48fTQPgc",
      title: "Environmental Durability Test | Lab Testing | SOLARWATT UK & Ireland",
      thumbnail: `https://img.youtube.com/vi/mrJ48fTQPgc/maxresdefault.jpg`
    },
    {
      id: "Abo4O3hyH7Q",
      title: "SOLARWATT Lab Testing | Part 3",
      thumbnail: `https://img.youtube.com/vi/Abo4O3hyH7Q/maxresdefault.jpg`
    },
    {
      id: "EiYgJdVlw4A",
      title: "SOLARWATT Lab Testing | Part 4",
      thumbnail: `https://img.youtube.com/vi/EiYgJdVlw4A/maxresdefault.jpg`
    },
    {
      id: "71pC6HTLd8k",
      title: "SOLARWATT Testing Video 5",
      thumbnail: `https://img.youtube.com/vi/71pC6HTLd8k/maxresdefault.jpg`
    },
    {
      id: "5LbSmQt4J2E",
      title: "SOLARWATT Testing Video 6", 
      thumbnail: `https://img.youtube.com/vi/5LbSmQt4J2E/maxresdefault.jpg`
    }
  ];

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-gray-900">
      <div className="container px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Header Section */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Tired of Unpredictable Bills and Systems You Can't Trust?
            </h3>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Your savings mean nothing if your panels fail.
            </p>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
              That's why our German-engineered Solarwatt modules are lab-tested beyond real-world Irish weather — ensuring consistent performance and verified long-term savings.
            </p>
          </motion.div>

          {/* Proof Statement */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              See the Proof Behind Your Long-Term Savings
            </h4>
            <p className="text-lg text-gray-700">
              Every Panel Tested, Every Claim Verified.
            </p>
          </motion.div>

          {/* Video Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" variants={containerVariants}>
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-800 hover:bg-gray-700 transition-all duration-300"
                variants={itemVariants}
                onClick={() => openVideo(video.id)}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-6 w-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {video.title}
                  </h5>
                </div>
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