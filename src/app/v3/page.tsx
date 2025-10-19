"use client";

import { useState } from 'react';
import { HeroV3 } from '@/components/landing/hero-v3';
import { SolarSavingsSection } from '@/components/landing/solar-savings-section';
import { ProofSection } from '@/components/landing/proof-section';
import { MixedBrandProblems } from '@/components/landing/mixed-brand-problems';
import { ProductDetails } from '@/components/landing/product-details';
import { DurabilityVideo } from '@/components/landing/durability-video';
import { Process } from '@/components/landing/process';
import { ProcessCta } from '@/components/landing/process-cta';
import { Testimonials } from '@/components/landing/testimonials';
import { Consultation } from '@/components/landing/consultation';
import { FinalCta } from '@/components/landing/final-cta';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import CalculatorModal from '@/components/CalculatorModal';

// Solix Header component matching the reference design
function SolixHeader({ onOpenCalculator }: { onOpenCalculator?: () => void }) {
  return (
    <header className="absolute top-0 z-50 w-full">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Local Power</h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <button className="text-white/90 hover:text-white font-medium">Home</button>
          <button className="text-white/90 hover:text-white font-medium">Product</button>
          <button className="text-white/90 hover:text-white font-medium">Maintenance</button>
          <button className="text-white/90 hover:text-white font-medium">About Us</button>
          <button className="px-6 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 font-medium backdrop-blur-sm border border-white/20">
            Contact Us →
          </button>
        </nav>
        <div className="flex md:hidden">
          <button className="px-4 py-2 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm border border-white/20">
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}

// Simple Final CTA component without external dependencies
function SimpleFinalCta({ onOpenCalculator }: { onOpenCalculator?: () => void }) {
  return (
    <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Ready to Start Saving? (V3)
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
              Get your personalized solar quote today and join thousands of satisfied customers with our improved V3 experience.
            </p>
          </div>
          <button 
            onClick={onOpenCalculator}
            className="px-8 py-3 bg-background text-foreground rounded-md hover:bg-background/90 font-semibold"
          >
            Check My Savings - V3
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomeV3() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="bg-background">
      <SolixHeader onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <main>
        <HeroV3 onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <SolarSavingsSection onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <Testimonials />
        <ProofSection />
        <MixedBrandProblems />
        <ProductDetails />
        <DurabilityVideo />
        <Process />
        <ProcessCta />
        <Consultation />
        <SimpleFinalCta onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <Faq />
      </main>
      <Footer />
      
      {/* Preserve existing Calculator Modal */}
      <CalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
}