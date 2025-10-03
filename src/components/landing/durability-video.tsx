"use client";

import { motion } from "framer-motion";

export function DurabilityVideo() {
  return (
    <motion.section 
        id="durability-video" 
        className="w-full py-12 md:py-24 bg-secondary/50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
    >
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Built to Withstand Anything</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl/relaxed">
              Our German-engineered glass-glass panels are incredibly tough. Watch this unedited footage of our panel surviving extreme impact tests.
            </p>
        </div>
        <div className="max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden border-2 border-primary/20">
            <video
                src="https://firebasestorage.googleapis.com/v0/b/localpower-60d8a.firebasestorage.app/o/WebP%2FStrong%20enough%20(1).webm?alt=media&token=69cff0e0-a4a9-49bf-9648-aa6530c2b952"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full"
            />
        </div>
      </div>
    </motion.section>
  );
}
