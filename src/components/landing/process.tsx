"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

const processSteps = [
    {
        title: "Consultation & Design",
        description: "We discuss your needs, assess your property, and design a custom system tailored to you.",
        imgSrc: "https://placehold.co/400x300.png",
        imgAlt: "Illustration of a solar consultation and design process.",
        imgHint: "illustration consultation",
    },
    {
        title: "Quote & Grant Approval",
        description: "You receive a clear, detailed quote. We handle all the SEAI grant paperwork on your behalf.",
        imgSrc: "https://placehold.co/400x300.png",
        imgAlt: "Illustration of receiving a quote and grant approval.",
        imgHint: "illustration quote",
    },
    {
        title: "Professional Installation",
        description: "Our certified, in-house team installs your system efficiently and safely, typically in just 1-2 days.",
        imgSrc: "https://placehold.co/400x300.png",
        imgAlt: "Illustration of professional solar panel installation.",
        imgHint: "illustration installation",
    },
    {
        title: "Activation & Savings",
        description: "We activate your system, give you a walkthrough, and you start generating savings from day one.",
        imgSrc: "https://placehold.co/400x300.png",
        imgAlt: "Illustration of a home enjoying solar energy and savings.",
        imgHint: "illustration savings",
    }
];

const DottedArrowDown = () => (
  <div className="absolute top-[25%] left-[calc(100%_+_1rem)] w-32 h-24 hidden lg:block" aria-hidden="true">
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M2 20C2 40 40 80 98 80" stroke="hsl(var(--primary))" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      <path d="M93 75L98 80L93 85" stroke="hsl(var(--primary))" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const DottedArrowUp = () => (
  <div className="absolute top-[25%] left-[calc(100%_+_1rem)] w-32 h-24 hidden lg:block" aria-hidden="true">
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M2 80C2 60 40 20 98 20" stroke="hsl(var(--primary))" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
      <path d="M93 15L98 20L93 25" stroke="hsl(var(--primary))" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export function Process() {
    return (
        <section id="process" className="w-full bg-background py-12 md:py-24 overflow-x-hidden">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-4">The Process</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                    <p className="mx-auto text-muted-foreground md:text-xl/relaxed mt-4">
                        From first call to full activation, we've refined our process to be as simple and seamless as possible for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-32 gap-y-16">
                    {processSteps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            className="relative flex flex-col items-center text-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <div className="mb-6">
                                <Image
                                    src={step.imgSrc}
                                    alt={step.imgAlt}
                                    width={400}
                                    height={300}
                                    className="object-contain rounded-lg shadow-lg aspect-[4/3]"
                                    data-ai-hint={step.imgHint}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-base flex-grow">{step.description}</p>
                            
                            {index < processSteps.length - 1 && (
                                <>
                                    {index % 2 === 0 ? <DottedArrowDown /> : <DottedArrowUp />}
                                </>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
