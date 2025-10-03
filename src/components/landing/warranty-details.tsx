import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Wrench, Truck, Repeat, CheckCircle, CalendarDays } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

export function WarrantyDetails() {
    return (
        <section className="w-full py-12 md:py-24 bg-secondary">
            <div className="container px-4 md:px-6">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Peace of Mind</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">The Longest, Strongest Solar Warranty in Ireland</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            With SOLARWATT, you're not just buying solar panels; you're investing in three decades of guaranteed performance and protection. Our 30-year "all-inclusive" warranty covers the product, its performance, and all associated costs if a claim is needed.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        {warrantyBenefits.map((benefit) => (
                            <div key={benefit.title} className="flex items-start gap-4">
                                <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{benefit.title}</h3>
                                    <p className="text-muted-foreground">{benefit.description}</p>
                                    <p className="text-sm mt-1 text-primary/80 font-semibold">{benefit.advantage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
