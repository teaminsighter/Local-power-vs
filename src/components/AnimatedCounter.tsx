'use client';

import { motion, useAnimation, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter = ({ 
  end, 
  duration = 2, 
  prefix = '', 
  suffix = '', 
  className = '' 
}: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayValue = useTransform(rounded, (latest) => {
    return `${prefix}${latest.toLocaleString()}${suffix}`;
  });
  
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      const controls = count.set(end);
    }
  }, [inView, count, end]);

  return (
    <motion.span 
      ref={ref} 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {inView ? `${prefix}${end.toLocaleString()}${suffix}` : `${prefix}0${suffix}`}
    </motion.span>
  );
};

export default AnimatedCounter;