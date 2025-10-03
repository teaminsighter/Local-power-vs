'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon } from './sun-icon';

export function IdleSunCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      setIsVisible(false);
      
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }

      idleTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // 3 seconds
    };
    
    const setInitialPosition = (e: MouseEvent) => {
        setPosition({ x: e.clientX, y: e.clientY });
    }
    // Set an initial position and timer when the component mounts
    window.addEventListener('mousemove', setInitialPosition, { once: true });
    
    idleTimeout.current = setTimeout(() => {
        setIsVisible(true);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', setInitialPosition);
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="pointer-events-none fixed z-[9999]"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, 0)',
          }}
        >
          <SunIcon size={70} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
