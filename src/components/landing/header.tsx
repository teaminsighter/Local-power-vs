"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { pushToDataLayer } from '@/lib/gtm';

interface HeaderProps {
  onOpenCalculator?: () => void;
}

export function Header({ onOpenCalculator }: HeaderProps) {
  const scrollToFinalCta = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pushToDataLayer('select_content', {
      content_type: 'navigation_link',
      item_id: 'Request Free Quote'
    });
  };

  const scrollToProducts = () => {
    document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pushToDataLayer('select_content', {
      content_type: 'navigation_link',
      item_id: 'Products'
    });
  };

  const scrollToProcess = () => {
    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pushToDataLayer('select_content', {
      content_type: 'navigation_link',
      item_id: 'How It Works'
    });
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      id="main-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container flex h-20 items-center">
        <div className="mr-4 flex items-center">
          <a href="#" className="flex items-center" id="header-logo-link">
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/localpower-60d8a.firebasestorage.app/o/Local-Power-logo-green.jpg?alt=media&token=e473a750-1fa9-4e11-b3f0-ddb128741b42"
                alt="Local Power Logo"
                width={200}
                height={50}
                className="h-10 w-auto"
                priority
            />
          </a>
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <Button onClick={scrollToProducts} className="font-bold text-foreground hover:bg-accent/50 nav-link bg-transparent border-none" id="header-nav-products">
            Products
          </Button>
          <Button onClick={scrollToProcess} className="font-bold text-foreground hover:bg-accent/50 nav-link bg-transparent border-none" id="header-nav-process">
            How It Works
          </Button>
          <Button onClick={scrollToFinalCta} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cta-button" id="header-cta-desktop">
            Request Free Quote
          </Button>
        </nav>
        <div className="flex md:hidden flex-1 items-center justify-end space-x-2">
           <Button onClick={scrollToFinalCta} className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cta-button text-sm px-3 py-2" id="header-cta-mobile">
            Request Quote
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
