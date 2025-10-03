import Image from 'next/image';
import { BrainCircuit, Zap, Smartphone, ShieldCheck, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

export function ManagerDetails() {
  return (
    <section className="w-full py-12 md:py-24 bg-card">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            <div className="flex justify-center">
                 <Image src="https://placehold.co/500x500.png" alt="SOLARWATT Manager" width={500} height={500} className="rounded-xl shadow-2xl" data-ai-hint="smart home controller" />
            </div>
            <div className="space-y-6">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold">Your System's Brain</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Intelligent Home Energy Control</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The award-winning SOLARWATT Manager is the central controller of your home energy ecosystem, orchestrating your solar panels, battery, EV charger, and heat pump to maximize your self-sufficiency and savings.
                </p>
                <div className="grid gap-6">
                   {managerBenefits.map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-4">
                            <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{benefit.title}</h3>
                                <p className="text-muted-foreground">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
