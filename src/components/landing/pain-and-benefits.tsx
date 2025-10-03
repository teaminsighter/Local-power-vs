"use client";

import { Card } from '@/components/ui/card';
import { TrendingUp, ShieldOff, Footprints, TrendingDown, ShieldCheck, Leaf, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function PainAndBenefits() {
    const scrollToProducts = () => {
        document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const pains = [
        {
            icon: TrendingUp,
            title: "Skyrocketing Bills",
            description: "Your electricity costs keep climbing with no end in sight, making budgeting impossible."
        },
        {
            icon: ShieldOff,
            title: "Grid Dependency",
            description: "You're completely reliant on an aging grid, vulnerable to power cuts and price hikes."
        },
        {
            icon: Footprints,
            title: "Environmental Impact",
            description: "You want to do your part for the planet but feel stuck using fossil fuel energy."
        }
    ];

    const benefits = [
        {
            icon: TrendingDown,
            title: "Cut Bills Dramatically",
            description: "Generate your own free electricity and watch your bills plummet, saving thousands per year."
        },
        {
            icon: ShieldCheck,
            title: "Energy Independence",
            description: "Power your home during outages and protect your family from future price hikes."
        },
        {
            icon: Leaf,
            title: "Power a Greener Home",
            description: "Dramatically reduce your carbon footprint by running on clean, renewable solar energy."
        }
    ];

  return (
    <>
      <motion.section 
        className="w-full py-12 md:py-24 bg-muted"
        id="pain-points"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tired of Unpredictable Bills and Grid Failures?</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              The daily frustrations of the old energy model are holding you back.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pains.map((pain, i) => (
                <motion.div
                    key={pain.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                    <Card className="flex flex-col items-center text-center p-8 shadow-lg space-y-6 bg-card h-full">
                        <div className="bg-destructive/10 text-destructive rounded-full p-4">
                            <pain.icon className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl lg:text-3xl font-bold">{pain.title}</h3>
                            <p className="text-muted-foreground text-base">{pain.description}</p>
                        </div>
                    </Card>
                </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="flex justify-center bg-muted pb-12 md:pb-24">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-lg">
            <ArrowDown className="w-10 h-10 text-primary/50 animate-bounce" />
        </div>
      </div>

      <motion.section 
        className="w-full pt-0 pb-12 md:pb-24 bg-background"
        id="benefits"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">The Solution: Own Your Power, Permanently.</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              A Local Power solar system is your one-time investment for a lifetime of savings and security.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
             {benefits.map((benefit, i) => (
                <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                    <Card className="flex flex-col items-center text-center p-8 shadow-xl space-y-6 bg-card h-full border-2 border-primary/20 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="bg-primary/10 text-primary rounded-full p-4">
                            <benefit.icon className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl lg:text-3xl font-bold">{benefit.title}</h3>
                            <p className="text-muted-foreground text-base">{benefit.description}</p>
                        </div>
                    </Card>
                </motion.div>
            ))}
          </div>
          <div className="text-center mt-16">
              <Button onClick={scrollToProducts} size="lg" className="font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg cta-button" id="benefits-cta-products">
                  See Our Solar Family
              </Button>
          </div>
        </div>
      </motion.section>
    </>
  );
}
