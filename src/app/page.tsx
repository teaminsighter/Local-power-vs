"use client";

import { useState } from 'react';
import { Hero } from '@/components/landing/hero';
import { PainAndBenefits } from '@/components/landing/pain-and-benefits';
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

// Simple Header component without external dependencies
function SimpleHeader({ onOpenCalculator }: { onOpenCalculator?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">LOCAL POWER</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <button className="text-muted-foreground hover:text-foreground">Products</button>
          <button className="text-muted-foreground hover:text-foreground">How It Works</button>
          {onOpenCalculator && (
            <button 
              onClick={onOpenCalculator}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Check My Savings
            </button>
          )}
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Request Free Quote
          </button>
        </nav>
        <div className="flex md:hidden space-x-2">
          {onOpenCalculator && (
            <button 
              onClick={onOpenCalculator}
              className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
            >
              Calculator
            </button>
          )}
          <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm">
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
              Ready to Start Saving?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
              Get your personalized solar quote today and join thousands of satisfied customers.
            </p>
          </div>
          <button className="px-8 py-3 bg-background text-foreground rounded-md hover:bg-background/90 font-semibold">
            Get Free Quote Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="bg-background">
      <SimpleHeader onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <main>
        <Hero onOpenCalculator={() => setIsCalculatorOpen(true)} />
        <PainAndBenefits />
        <ProductDetails />
        <DurabilityVideo />
        <Process />
        <ProcessCta />
        <Testimonials />
        <Consultation />
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