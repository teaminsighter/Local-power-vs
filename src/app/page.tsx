'use client';

import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
// import HowItWorksSection from '@/components/HowItWorksSection';
// import WhyChooseSolarSection from '@/components/WhyChooseSolarSection';
import StateSelection from '@/components/StateSelection';
import SolutionChooser from '@/components/SolutionChooser';
import CTASection from '@/components/CTASection';
import CalculatorModal from '@/components/CalculatorModal';

export default function Home() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleOpenCalculator = () => {
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    setIsCalculatorOpen(false);
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen">
        <Navigation onGetQuoteClick={handleOpenCalculator} />
        <HeroSection onGetQuoteClick={handleOpenCalculator} />
        {/* <HowItWorksSection />
        <WhyChooseSolarSection /> */}
        <StateSelection />
        <SolutionChooser />
        <CTASection />
        
        <CalculatorModal 
          isOpen={isCalculatorOpen} 
          onClose={handleCloseCalculator} 
        />
      </main>
    </ErrorBoundary>
  );
}
