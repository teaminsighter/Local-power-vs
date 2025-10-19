"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

export function LogoSlider() {
  return (
    <section className="w-full py-8 bg-white/10 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <div className="overflow-hidden">
          <motion.div
            className="flex items-center gap-12"
            animate={{
              x: [0, -400],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* First set of logos */}
            <Image
              src="/logos/footer_badge_forover30years.svg"
              alt="30+ Years Experience Badge"
              width={120}
              height={60}
              className="opacity-80"
            />
            <Image
              src="/logos/Website_Siegel 1-705x397.webp"
              alt="Certificate Siegel"
              width={160}
              height={90}
              className="opacity-80"
            />
            
            {/* Duplicate set for seamless loop */}
            <Image
              src="/logos/footer_badge_forover30years.svg"
              alt="30+ Years Experience Badge"
              width={120}
              height={60}
              className="opacity-80"
            />
            <Image
              src="/logos/Website_Siegel 1-705x397.webp"
              alt="Certificate Siegel"
              width={160}
              height={90}
              className="opacity-80"
            />
            
            {/* Third set for continuous effect */}
            <Image
              src="/logos/footer_badge_forover30years.svg"
              alt="30+ Years Experience Badge"
              width={120}
              height={60}
              className="opacity-80"
            />
            <Image
              src="/logos/Website_Siegel 1-705x397.webp"
              alt="Certificate Siegel"
              width={160}
              height={90}
              className="opacity-80"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}