
"use client";

import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Image from 'next/image';
import { BrainCircuit, Zap, Smartphone, ShieldCheck, CalendarDays, Wrench, Truck, Repeat, ChevronLeft, ChevronRight, PanelTop, Battery, Waypoints, Shield, Bot, Box } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { pushToDataLayer } from '@/lib/gtm';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InteractiveImage } from "../ui/interactive-image";

const batterySpecs = [
    { feature: "Usable Energy", value: "5.2 – 18.2 kWh (expandable)" },
    { feature: "Coupling", value: "DC-coupling & Hybrid Inverter" },
    { feature: "Backup Power", value: "Yes, reliable during grid failures" },
    { feature: "Install Location", value: "Indoors or outdoors, IP65 rated" },
    { feature: "Warranty", value: "12 years performance, 10 years product" },
    { feature: "Cell Technology", value: "LiFePO4 (safest, longest-lasting)" },
    { feature: "Max Efficiency", value: ">95% round trip" },
    { feature: "Cooling", value: "Passive, silent operation" },
];

const inverterSpecs = [
    { model: "3.0 kW", output: "3,000 W", efficiency: "97.01%" },
    { model: "3.7 kW", output: "3,680 W", efficiency: "97.08%" },
    { model: "4.6 kW", output: "4,600 W", efficiency: "97.04%" },
    { model: "5.0 kW", output: "5,000 W", efficiency: "97.08%" },
    { model: "6.0 kW", output: "6,000 W", efficiency: "97.08%" },
];

const managerBenefits: { icon: LucideIcon; title: string; description: string }[] = [
    {
        icon: BrainCircuit,
        title: "Central Energy Control",
        description: "One app to manage your entire home's energy: solar generation, battery storage, EV charging, and heating.",
    },
    {
        icon: Zap,
        title: "Maximize Self-Consumption",
        description: "Intelligently uses every ray of sun, directing surplus energy to where it's needed most to cut grid reliance.",
    },
    {
        icon: Smartphone,
        title: "Smart Scheduling & Analytics",
        description: "Automatically charge your EV or run your heat pump with free solar power. Spot usage trends to reduce waste.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Future-Proof",
        description: "Your data is kept safe on European servers. Automatic updates ensure your system is always current.",
    },
];

const warrantyBenefits: { icon: LucideIcon; title: string; description: string; advantage: string }[] = [
    {
        icon: CalendarDays,
        title: "30-Year Product & Performance Warranty",
        description: "Worry-free for three decades. You’re protected against functional defects and guaranteed power output.",
        advantage: "Industry norm is 12–25 years. We guarantee at least 87% output after 30 years."
    },
    {
        icon: Wrench,
        title: "All Transport & Labor Covered",
        description: "If a valid claim arises, SOLARWATT pays for everything: removal, reinstallation, and shipping.",
        advantage: "Zero out-of-pocket costs for you. Competitors often make you pay for labor."
    },
    {
        icon: Repeat,
        title: "Free Replacement or Upgrade",
        description: "If a model is discontinued, you get an equivalent or better new one, future-proofing your investment.",
        advantage: "Many brands offer only partial refunds or lower value replacements."
    },
    {
        icon: Truck,
        title: "Warranty Follows the Module",
        description: "If you sell your home, the full remaining warranty transfers to the new owner, adding resale value.",
        advantage: "Many brands make warranties non-transferable, reducing home value."
    },
];

const slides = [
    {
        type: "image",
        url: "https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Fproduct-family.webp?alt=media&token=703e4138-209f-4670-a1df-b7b3ff516a26",
        alt: "The SOLARWATT Vision product family: solar panel, battery, inverter, and smart manager app",
        width: 1200,
        height: 675,
    },
    {
        type: "image",
        url: "https://firebasestorage.googleapis.com/v0/b/localpower-60d8a.firebasestorage.app/o/WebP%2Fsmart_manager.webp?alt=media&token=cc217561-ddd8-4eef-9744-7a29c8080401",
        alt: "A complete overview of the SOLARWATT smart energy system.",
        width: 1200,
        height: 675,
    }
];

const TABS = [
    { value: "panels", label: "Glass-Glass Panels", icon: PanelTop },
    { value: "battery", label: "Battery Vision", icon: Battery },
    { value: "inverter", label: "Inverter Vision", icon: Waypoints },
    { value: "manager", label: "Smart Manager", icon: Bot },
    { value: "warranty", label: "Warranty", icon: Shield },
];


export function ProductDetails() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState(0); // Now index-based
  const [isInParallaxMode, setIsInParallaxMode] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxSectionRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0);
  const SCROLL_THRESHOLD = 300; // How much scroll needed to change section (increased for better control)

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      const parallaxSection = parallaxSectionRef.current;
      if (!parallaxSection) return;

      const rect = parallaxSection.getBoundingClientRect();
      const isInView = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;

      if (isInView && !isInParallaxMode) {
        // Entering parallax mode
        setIsInParallaxMode(true);
        document.body.style.overflow = 'hidden';
        e.preventDefault();
        return;
      }

      if (isInParallaxMode) {
        e.preventDefault();
        
        // Detect scroll direction
        const direction = e.deltaY > 0 ? 'down' : 'up';
        setScrollDirection(direction);
        
        // Accumulate scroll
        scrollAccumulator.current += Math.abs(e.deltaY);
        
        if (scrollAccumulator.current >= SCROLL_THRESHOLD) {
          scrollAccumulator.current = 0;
          
          if (direction === 'down') {
            // Scroll down - next section
            if (activeSection < TABS.length - 1) {
              setActiveSection(prev => prev + 1);
              pushToDataLayer('select_content', {
                content_type: 'product_section',
                item_id: TABS[activeSection + 1].value
              });
            } else {
              // End of parallax - resume normal scrolling
              setIsInParallaxMode(false);
              document.body.style.overflow = 'auto';
              window.scrollBy(0, 100); // Continue scrolling down
            }
          } else {
            // Scroll up - previous section
            if (activeSection > 0) {
              setActiveSection(prev => prev - 1);
            } else {
              // Beginning of parallax - resume normal scrolling
              setIsInParallaxMode(false);
              document.body.style.overflow = 'auto';
              window.scrollBy(0, -100); // Continue scrolling up
            }
          }
        }
      }
    };

    // Add wheel event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleScroll);
      document.body.style.overflow = 'auto'; // Cleanup
    };
  }, [activeSection, isInParallaxMode]);

  const nextSlide = () => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const scrollToSection = (index: number) => {
    if (!isInParallaxMode) {
      setActiveSection(index);
    }
  };
  
  const currentSlideData = slides[currentSlide];

  return (
    <motion.section 
        id="product-details" 
        className="w-full py-12 md:py-24 bg-card"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
    >
        <div className="container px-4 md:px-6">

            {/* Parallax Sticky Navigation Section */}
            <div 
                ref={parallaxSectionRef}
                className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 min-h-screen relative"
            >
                {/* Left Sticky Navigation */}
                <div className="lg:block">
                    <div className="sticky top-24 space-y-2 bg-card/80 backdrop-blur-sm rounded-lg p-4 lg:bg-transparent lg:backdrop-blur-none lg:p-0">
                        <h3 className="text-lg font-semibold mb-4 lg:hidden">Product Features</h3>
                        {TABS.map((tab, index) => (
                            <button
                                key={tab.value}
                                onClick={() => scrollToSection(index)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-500 ease-in-out hover:bg-secondary/50",
                                    activeSection === index 
                                        ? "bg-primary text-primary-foreground font-semibold shadow-lg transform scale-105" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                id={`product-nav-${tab.value}`}
                            >
                                <tab.icon className="h-6 w-6 flex-shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                        
                        {/* Parallax Mode Indicator */}
                        {isInParallaxMode && (
                            <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-primary/10 rounded">
                                Scroll to navigate • {activeSection + 1}/{TABS.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content Area with Fade Animations */}
                <div className="relative min-h-[80vh] flex items-center">
                    <AnimatePresence mode="wait">
                        {TABS.map((tab, index) => 
                            activeSection === index && (
                                <motion.div
                                    key={tab.value}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full flex items-center"
                                >
                                    {renderSectionContent(index)}
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </motion.section>
  );
}

// Helper function to render section content
function renderSectionContent(index: number) {
  const tab = TABS[index];
  
  switch (tab.value) {
    case 'panels':
      return (
        <Card className="overflow-hidden shadow-lg border-0 w-full">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 space-y-4">
                    <CardTitle className="text-3xl md:text-4xl">SOLARWATT Glass-Glass Panels</CardTitle>
                    <CardDescription className="text-lg">Extremely durable and high-performance panels with an industry-leading 30-year warranty.</CardDescription>
                    <p className="text-muted-foreground text-base">Our glass-glass solar panels are engineered in Germany for exceptional longevity and yield security. They are resistant to weather, mechanical stress, and degradation, ensuring stable, high performance for decades.</p>
                </div>
                <div className="md:h-full bg-secondary/20 p-8 flex items-center justify-center">
                    <InteractiveImage 
                        src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Fpanel.webp?alt=media&token=1610fdee-e7be-4250-9728-08f06c400b8c" 
                        alt="SOLARWATT Glass-Glass Panels" 
                        width={400} 
                        height={600} 
                        className="object-contain w-full h-full transition-all duration-300"
                        data-ai-hint="solar panel"
                    />
                </div>
            </div>
            <CardContent className="p-8 bg-secondary/30">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-base">Feature</TableHead>
                            <TableHead className="text-base">Benefit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium text-base">30-Year Product Warranty</TableCell>
                            <TableCell className="text-base">Protection against material and manufacturing defects for three decades.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium text-base">30-Year Performance Warranty</TableCell>
                            <TableCell className="text-base">Guarantees at least 87% of rated power output in year 30.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium text-base">Extreme Durability</TableCell>
                            <TableCell className="text-base">Resistant to hail, snow load (up to 8,100 Pa), and salt mist.</TableCell>
                        </TableRow>
                        <TableRow className="border-b-0">
                            <TableCell className="font-medium text-base">High Yield Security</TableCell>
                            <TableCell className="text-base">Minimal degradation ensures higher energy production over the panel's lifetime.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      );
      
    case 'battery':
      return (
        <Card className="overflow-hidden shadow-lg border-0 w-full">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 space-y-4">
                    <CardTitle className="text-3xl md:text-4xl">SOLARWATT Battery Vision</CardTitle>
                    <CardDescription className="text-lg">A robust, modular battery storage solution for maximum efficiency, flexibility, and safety.</CardDescription>
                </div>
                <div className="md:h-full bg-secondary/20 p-8 flex flex-col items-center justify-center gap-4">
                    <InteractiveImage 
                        src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Fbattery.webp?alt=media&token=c8fcf6b3-7dd8-42bf-9cc1-ed8f9e27a3be" 
                        alt="SOLARWATT Battery Vision" 
                        width={400} 
                        height={400} 
                        className="object-contain w-full h-full transition-all duration-300"
                        data-ai-hint="solar battery"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" id="battery-3d-button"><Box className="mr-2 h-4 w-4" />View 3D Model</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh] p-0">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle>Interactive 3D Model: Battery Vision</DialogTitle>
                            </DialogHeader>
                            <iframe
                                src="https://solarwatt-uk-ireland.github.io/3d/?alt=Battery%20vision%20(1%20top%20pack%20+%204%20packs)&url=https://solarwatt.canto.global/direct/other/42ong69g8l0nfcffu7sq3kk02k/sLRCETphimRvsjsuKD0YFy-bSho/original?content-type=glb&name=Battery+vision+%281+top+pack+%2B+4+pack%29.glb"
                                title="SOLARWATT Battery Vision 3D Model"
                                className="w-full h-full border-0"
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                id="battery-3d-viewer"
                            ></iframe>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <CardContent className="p-8 bg-secondary/30">
                <Table>
                    <TableBody>
                        {[
                            { feature: "Usable Energy", value: "5.2 – 18.2 kWh (expandable)" },
                            { feature: "Coupling", value: "DC-coupling & Hybrid Inverter" },
                            { feature: "Backup Power", value: "Yes, reliable during grid failures" },
                            { feature: "Install Location", value: "Indoors or outdoors, IP65 rated" },
                            { feature: "Warranty", value: "12 years performance, 10 years product" },
                            { feature: "Cell Technology", value: "LiFePO4 (safest, longest-lasting)" },
                            { feature: "Max Efficiency", value: ">95% round trip" },
                            { feature: "Cooling", value: "Passive, silent operation" },
                        ].map((spec, index, array) => (
                            <TableRow key={spec.feature} className={index === array.length -1 ? 'border-b-0' : ''}>
                                <TableCell className="font-medium w-1/3 text-base">{spec.feature}</TableCell>
                                <TableCell className="text-base">{spec.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      );

    case 'inverter':
      return (
        <Card className="overflow-hidden shadow-lg border-0 w-full">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 space-y-4">
                    <CardTitle className="text-3xl md:text-4xl">SOLARWATT Inverter Vision One</CardTitle>
                    <CardDescription className="text-lg">High-efficiency, single-phase hybrid inverters with silent operation and a 10-year warranty.</CardDescription>
                </div>
                <div className="md:h-full bg-secondary/20 p-8 flex flex-col items-center justify-center gap-4">
                    <InteractiveImage 
                        src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Finverter.webp?alt=media&token=1e34bf04-6fba-4f80-84d1-dd7d69709fa5" 
                        alt="SOLARWATT Inverter Vision One" 
                        width={400} 
                        height={400} 
                        className="object-contain w-full h-full transition-all duration-300"
                        data-ai-hint="solar inverter"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" id="inverter-3d-button"><Box className="mr-2 h-4 w-4" />View 3D Model</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh] p-0">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle>Interactive 3D Model: Inverter Vision One</DialogTitle>
                            </DialogHeader>
                            <iframe
                                src="https://solarwatt-uk-ireland.github.io/3d/?alt=Inverter%20vision%20one&url=https://solarwatt.canto.global/direct/other/157ikh7gfh6hrbbfrkfn11mn70/TgAPOuYHwi38sPP6w31DbGl7jQs/original?content-type=glb&name=Inverter+vision+one.glb"
                                title="SOLARWATT Inverter Vision 3D Model"
                                className="w-full h-full border-0"
                                allow="autoplay; fullscreen; xr-spatial-tracking"
                                id="inverter-3d-viewer"
                            ></iframe>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <CardContent className="p-8 bg-secondary/30">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-base">Model</TableHead>
                            <TableHead className="text-base">Rated Output Power</TableHead>
                            <TableHead className="text-base">Max Efficiency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            { model: "3.0 kW", output: "3,000 W", efficiency: "97.01%" },
                            { model: "3.7 kW", output: "3,680 W", efficiency: "97.08%" },
                            { model: "4.6 kW", output: "4,600 W", efficiency: "97.04%" },
                            { model: "5.0 kW", output: "5,000 W", efficiency: "97.08%" },
                            { model: "6.0 kW", output: "6,000 W", efficiency: "97.08%" },
                        ].map((spec, index, array) => (
                            <TableRow key={spec.model} className={index === array.length -1 ? 'border-b-0' : ''}>
                                <TableCell className="font-medium text-base">{spec.model}</TableCell>
                                <TableCell className="text-base">{spec.output}</TableCell>
                                <TableCell className="text-base">{spec.efficiency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      );

    case 'manager':
      return (
        <Card className="overflow-hidden shadow-lg border-0 w-full">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 space-y-4">
                    <CardTitle className="text-3xl md:text-4xl">Intelligent Home Energy Control</CardTitle>
                    <CardDescription className="text-lg">The award-winning SOLARWATT Manager is the central controller of your home energy ecosystem.</CardDescription>
                </div>
                <div className="md:h-full bg-secondary/20 flex items-center justify-center p-8">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="group"
                    >
                        <Image 
                            src="https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Fapp.webp?alt=media&token=ff8b9ad0-72bb-4b72-b448-a30e313cb75f"
                            alt="SOLARWATT Manager App Dashboard" 
                            width={380} 
                            height={507} 
                            className="object-contain max-h-[450px] w-auto drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] md:drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:drop-shadow-[0_35px_65px_-15px_rgba(0,0,0,0.5)]"
                            data-ai-hint="smart home app dashboard"
                        />
                    </motion.div>
                </div>
            </div>
            <CardContent className="p-8 bg-secondary/30">
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        {
                            icon: BrainCircuit,
                            title: "Central Energy Control",
                            description: "One app to manage your entire home's energy: solar generation, battery storage, EV charging, and heating.",
                        },
                        {
                            icon: Zap,
                            title: "Maximize Self-Consumption",
                            description: "Intelligently uses every ray of sun, directing surplus energy to where it's needed most to cut grid reliance.",
                        },
                        {
                            icon: Smartphone,
                            title: "Smart Scheduling & Analytics",
                            description: "Automatically charge your EV or run your heat pump with free solar power. Spot usage trends to reduce waste.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "Secure & Future-Proof",
                            description: "Your data is kept safe on European servers. Automatic updates ensure your system is always current.",
                        },
                    ].map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-4">
                            <div className="bg-primary text-primary-foreground rounded-full p-3 flex-shrink-0 mt-1">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{benefit.title}</h3>
                                <p className="text-base text-muted-foreground">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      );

    case 'warranty':
      return (
        <Card className="overflow-hidden shadow-lg border-0 w-full">
            <div className="p-8 text-center">
                <CardTitle className="text-3xl md:text-4xl">The Longest, Strongest Solar Warranty in Ireland</CardTitle>
                <CardDescription className="mt-2 max-w-2xl mx-auto text-lg">With SOLARWATT, you're not just buying solar panels; you're investing in three decades of guaranteed performance and protection.</CardDescription>
            </div>
            <CardContent className="p-8 bg-secondary/30">
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        {
                            icon: CalendarDays,
                            title: "30-Year Product & Performance Warranty",
                            description: "Worry-free for three decades. You're protected against functional defects and guaranteed power output.",
                            advantage: "Industry norm is 12–25 years. We guarantee at least 87% output after 30 years."
                        },
                        {
                            icon: Wrench,
                            title: "All Transport & Labor Covered",
                            description: "If a valid claim arises, SOLARWATT pays for everything: removal, reinstallation, and shipping.",
                            advantage: "Zero out-of-pocket costs for you. Competitors often make you pay for labor."
                        },
                        {
                            icon: Repeat,
                            title: "Free Replacement or Upgrade",
                            description: "If a model is discontinued, you get an equivalent or better new one, future-proofing your investment.",
                            advantage: "Many brands offer only partial refunds or lower value replacements."
                        },
                        {
                            icon: Truck,
                            title: "Warranty Follows the Module",
                            description: "If you sell your home, the full remaining warranty transfers to the new owner, adding resale value.",
                            advantage: "Many brands make warranties non-transferable, reducing home value."
                        },
                    ].map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-4">
                            <div className="bg-primary text-primary-foreground rounded-full p-3 flex-shrink-0 mt-1">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{benefit.title}</h3>
                                <p className="text-base text-muted-foreground">{benefit.description}</p>
                                <p className="text-base mt-2 text-primary/80 font-semibold">{benefit.advantage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      );
      
    default:
      return <div className="w-full p-8 text-center">Content for {tab.label} coming soon...</div>;
  }
}
