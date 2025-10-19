"use client";

import { useState } from 'react';
import { HeroV2 } from '@/components/landing/hero-v2';
import { SolarwattSystems } from '@/components/landing/solarwatt-systems';
import { ProofSection } from '@/components/landing/proof-section';
import { MixedBrandProblems } from '@/components/landing/mixed-brand-problems';
import { ProductDetails } from '@/components/landing/product-details';
import { DurabilityVideo } from '@/components/landing/durability-video';
import { Process } from '@/components/landing/process';
import { ProcessCta } from '@/components/landing/process-cta';
import { Testimonials } from '@/components/landing/testimonials';
import { FinalCta } from '@/components/landing/final-cta';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import CalculatorModal from '@/components/CalculatorModal';

// Simple Header component without external dependencies
function SimpleHeader({ onOpenCalculator }: { onOpenCalculator?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">LOCAL POWER V2</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <button className="text-muted-foreground hover:text-foreground">Products</button>
          <button className="text-muted-foreground hover:text-foreground">How It Works</button>
          <button className="px-4 py-2 text-white rounded-md" style={{backgroundColor: '#166b48'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e38'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166b48'}>
            Request Free Quote
          </button>
        </nav>
        <div className="flex md:hidden space-x-2">
          <button className="px-3 py-2 text-white rounded-md text-sm" style={{backgroundColor: '#166b48'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#134e38'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#166b48'}>
            Quote
          </button>
        </div>
      </div>
    </header>
  );
}

// Simple Final CTA component without external dependencies
function SimpleFinalCta() {
  return (
    <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Ready to Start Saving? (V2)
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
              Get your personalized solar quote today and join thousands of satisfied customers with our improved V2 experience.
            </p>
          </div>
          <button className="px-8 py-3 bg-background text-foreground rounded-md hover:bg-background/90 font-semibold">
            Get Free Quote Now - V2
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomeV2() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="bg-background">
      <SimpleHeader onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <main>
        <HeroV2 onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <SolarwattSystems />
        <ProofSection />
        <Testimonials />
        <MixedBrandProblems />
        <ProductDetails />
        <DurabilityVideo />
        <Process />
        <ProcessCta />
        <FinalCta />
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