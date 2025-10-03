'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image, { type ImageProps } from 'next/image';
import { motion } from 'framer-motion';

const SHADOW_DISTANCE = 45; // Max distance the shadow can move
const SHADOW_BLUR = 40; // Blur radius of the shadow
const SHADOW_OPACITY = 0.45; // Opacity of the shadow

export function InteractiveImage(props: ImageProps) {
  const [style, setStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      filter: `drop-shadow(0px 20px ${SHADOW_BLUR - 10}px rgba(0, 0, 0, ${SHADOW_OPACITY * 0.8}))`,
      transition: 'filter 0.4s ease-in-out',
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    const offsetX = mouseX / width - 0.5;
    const offsetY = mouseY / height - 0.5;

    const shadowX = -offsetX * SHADOW_DISTANCE;
    const shadowY = -offsetY * SHADOW_DISTANCE;

    setStyle({
      filter: `drop-shadow(${shadowX}px ${shadowY}px ${SHADOW_BLUR}px rgba(0, 0, 0, ${SHADOW_OPACITY}))`,
      transition: 'filter 0.1s ease-out',
    });
  };
  
  useEffect(() => {
    handleMouseLeave();
  }, [handleMouseLeave]);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="group w-auto h-full max-h-[400px]"
    >
      <Image
        style={style}
        {...props}
      />
    </motion.div>
  );
}
