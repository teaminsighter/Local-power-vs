import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, ShieldCheck, ArrowUpRight, BatteryCharging, Leaf, Sun, Award, Wrench, Car, BarChart, Lock, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const benefits: { icon: LucideIcon; title: string; description: string; advantage: string }[] = [
    {
        icon: ArrowUpRight,
        title: "Modular & Expandable",
        description: "Start small and easily expand your storage as your needs grow, ensuring your system always matches your lifestyle.",
        advantage: "Grows with you—no 'overbuy' risk. Most brands require buying big upfront."
    },
    {
        icon: ShieldCheck,
        title: "Highest Safety LiFePO4",
        description: "Proven safest battery chemistry—no fire/explosion risk for your home and loved ones.",
        advantage: "Certified to EU’s toughest safety/fire codes. Many brands use riskier chemistries."
    },
    {
        icon: Sun,
        title: "True Outdoor-Ready (IP65)",
        description: "Install anywhere—attic, utility room, or outdoors—thanks to a dustproof and waterproof build.",
        advantage: "Competitors often require indoor-only setups or extra weatherproofing."
    },
    {
        icon: Zap,
        title: "Ultra-High Efficiency",
        description: ">95% battery and up to 97% inverter efficiency means you keep more of your solar power, lowering bills.",
        advantage: "Many inverters waste more energy, costing you hundreds per year."
    },
    {
        icon: Wrench,
        title: "Quick, Easy Installation",
        description: "Our 'plug & play' system means faster, lower-cost installs with no expensive, time-consuming electrical work.",
        advantage: "Some brands require days of labor and expensive electricians."
    },
    {
        icon: BatteryCharging,
        title: "Reliable Backup Power",
        description: "Keep your lights on and critical appliances running during a power cut, automatically.",
        advantage: "Many brands charge extra for backup or don’t offer it at all."
    },
    {
        icon: Award,
        title: "12-Year Battery Warranty",
        description: "Relax with industry-best guarantees—no surprise 'out of pocket' battery replacement costs.",
        advantage: "Most competitors only offer 5–10 years on batteries."
    },
    {
        icon: Car,
        title: "EV Charging Integration",
        description: "Ready for your electric vehicle. Just 'plug in' via the SOLARWATT Manager for smart, solar-powered charging.",
        advantage: "Most battery systems aren’t future-proof for EVs."
    },
    {
        icon: UserCheck,
        title: "Local Irish Service Team",
        description: "Get fast, friendly support and simple returns from a direct line to Irish experts.",
        advantage: "No 'offshore' support headaches or long wait times."
    }
];

export function Benefits() {
  return (
    <section className="w-full py-12 md:py-24 bg-card">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why SOLARWATT is the Smarter Choice</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Discover the tangible advantages that set our solar solutions apart from the competition.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <benefit.icon className="w-6 h-6 text-primary" />
                            {benefit.title}
                        </CardTitle>
                        <CardDescription>{benefit.description}</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <div className="px-6 pb-6 mt-auto">
                <p className="text-sm font-semibold text-primary"><span className="font-bold">Advantage:</span> {benefit.advantage}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
