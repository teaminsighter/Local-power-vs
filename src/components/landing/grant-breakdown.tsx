
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Home, Layers, ClipboardCheck, CheckCircle, UserCheck, Euro, FileClock, Info, Banknote, PlugZap, Car, FileScan, ClipboardEdit, Lightbulb, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const grantChartData = [
  { year: "2022", grant: 2400 },
  { year: "2023", grant: 2400 },
  { year: "2024", grant: 2100 },
  { year: "2025", grant: 1800 },
  { year: "2026", grant: 1500 },
];

const grantChartConfig = {
  grant: {
    label: "Max Grant (€)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


const grantSections: {
    id: string;
    icon: LucideIcon;
    title: string;
    content: {
        icon: LucideIcon;
        heading: string;
        description: string;
        points: string[];
    }[];
}[] = [
    {
        id: "seai",
        icon: Award,
        title: "SEAI Solar PV Grant",
        content: [
            {
                icon: UserCheck,
                heading: "Eligibility & Scope",
                description: "Key requirements for homeowners to qualify for the grant.",
                points: [
                    "**Who qualifies:** All homeowners (including private landlords) with dwellings built and occupied before Dec 31, 2020, with no previous solar PV grant at that address.",
                    "**Capacity limit:** Grants cover systems up to 4 kWp.",
                    "**Pre-approval is mandatory:** You must have written grant approval before purchasing materials or starting installation.",
                ],
            },
            {
                icon: Euro,
                heading: "Grant Values & VAT",
                description: "A breakdown of the financial support you can receive.",
                points: [
                    "**First 2 kWp:** €800 per kWp (max €1,600).",
                    "**Every additional kWp:** €250 per kWp (up to 4kWp).",
                    "**Total Grant Cap (2024):** €2,100.",
                    "**0% VAT:** Since May 2023, all residential solar panel installations are zero-rated for VAT, significantly reducing your upfront cost.",
                ],
            },
            {
                icon: FileClock,
                heading: "Application & Timeline",
                description: "The process from application to receiving your payment.",
                points: [
                    "**Application:** We handle the online SEAI portal application for you.",
                    "**Installation Window:** Works must be completed within 8 months of grant approval.",
                    "**Post-Works BER:** A Building Energy Rating (BER) assessment is required after installation to receive payment.",
                    "**Payment:** SEAI typically processes payments within 4-6 weeks after we submit all final documentation.",
                ],
            },
        ],
    },
    {
        id: "one-stop",
        icon: Home,
        title: "One Stop Shop Scheme",
        content: [
            {
                icon: Info,
                heading: "Scheme Overview",
                description: "For homeowners planning a complete home energy upgrade.",
                points: [
                    "This scheme is for homeowners undertaking a deep retrofit with multiple energy upgrades (e.g., insulation, heat pump, and solar PV).",
                    "Projects are managed end-to-end by a registered One Stop Shop provider and must achieve a minimum B2 BER rating.",
                ],
            },
            {
                icon: Banknote,
                heading: "Financial Mechanism",
                description: "How grants and loans work under this scheme.",
                points: [
                    "**Upfront Deduction:** Grants up to €10,000 are deducted directly from your invoice, reducing the initial payment.",
                    "**Low-Cost Loans:** You can finance the remaining balance with a low-interest Home Energy Upgrade Loan (€5,000 - €75,000 over up to 10 years).",
                ],
            },
        ],
    },
    {
        id: "complementary",
        icon: Layers,
        title: "Other Incentives",
        content: [
            {
                icon: PlugZap,
                heading: "Clean Export Guarantee (CEG)",
                description: "Get paid for the surplus energy you send back to the grid.",
                points: ["Your electricity supplier will pay you for any surplus solar energy you export back to the grid. A smart meter is required."],
            },
            {
                icon: Car,
                heading: "EV Home Charger Grant",
                description: "Financial support for installing an electric vehicle charger at home.",
                points: ["Receive a separate grant of up to €300 towards the cost of installing a home electric vehicle charger."],
            },
            {
                icon: FileScan,
                heading: "BER Assessment Grant",
                description: "A grant to help cover the cost of your BER assessment.",
                points: ["A grant of up to €50 is available to cover the fee for your post-works BER assessment."],
            },
        ],
    },
    {
        id: "registration",
        icon: ClipboardCheck,
        title: "Registration & Policy",
        content: [
            {
                icon: ClipboardEdit,
                heading: "Micro-Generation Registration",
                description: "Mandatory registration with ESB Networks before installation.",
                points: ["All solar PV systems must be registered with ESB Networks before installation. We manage this entire process, which typically takes at least 4 weeks."],
            },
            {
                icon: Lightbulb,
                heading: "Future Developments",
                description: "Upcoming EU laws that will impact new homes in Ireland.",
                points: ["A proposed EU law will likely mandate solar panels on all new homes in Ireland by 2026-2029, making solar a standard feature for modern properties."],
            },
        ],
    },
];

export function GrantBreakdown() {
  const [activeGrant, setActiveGrant] = useState(grantSections[0].id);

  const selectedGrant = grantSections.find(g => g.id === activeGrant);

  return (
    <motion.section
      id="grant"
      className="w-full py-12 md:py-24 bg-secondary/50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
            Maximize Your Investment
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            A Complete Guide to Irish Solar Grants
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            Navigating solar incentives is simple with Local Power. Here’s a clear breakdown of every grant, tax credit, and benefit available to you. We handle all the paperwork.
          </p>
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
              <TrendingDown className="w-7 h-7" />
              <span>Act Now: Grant Reductions Are Happening</span>
            </h3>
            <p className="text-muted-foreground md:text-lg mt-2 mb-6 max-w-2xl mx-auto">
              The SEAI grant for solar installations has been significantly decreasing each year as part of a planned government phase-down. The value is highest right now, and waiting will directly reduce the amount of financial support you can receive. Acting sooner locks in the best possible return on your investment.
            </p>
            <Card className="shadow-xl border-border/50 text-left bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                  <ChartContainer config={grantChartConfig} className="h-64 w-full">
                      <BarChart accessibilityLayer data={grantChartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                              dataKey="year"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => value}
                          />
                          <YAxis
                              tickFormatter={(value) => `€${new Intl.NumberFormat('en-IE').format(value)}`}
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              width={70}
                          />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Bar dataKey="grant" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                  </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>


        <div className="mt-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
            {/* Navigation Column */}
            <div className="md:col-span-1 sticky top-24">
                <div className="flex flex-col gap-2">
                    {grantSections.map((section) => (
                        <Button
                            key={section.id}
                            variant="ghost"
                            onClick={() => setActiveGrant(section.id)}
                            className={cn(
                                "justify-start text-left h-auto py-3 px-4 text-base transition-all duration-200",
                                activeGrant === section.id 
                                    ? "bg-primary text-primary-foreground shadow-md" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <section.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                            <span>{section.title}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content Column */}
            <div className="md:col-span-2">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGrant}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-6"
                    >
                        {selectedGrant && selectedGrant.content.map((subSection) => (
                            <Card key={subSection.heading} className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
                                        <subSection.icon className="w-7 h-7 text-primary flex-shrink-0" />
                                        <span>{subSection.heading}</span>
                                    </CardTitle>
                                    {subSection.description && <CardDescription className="text-base pt-1 pl-[44px] text-foreground">{subSection.description}</CardDescription>}
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    {subSection.points && subSection.points.length > 0 && (
                                        <ul className="space-y-4 pl-[44px]">
                                            {subSection.points.map((point, pIndex) => (
                                                <li key={pIndex} className="flex items-start gap-4">
                                                    <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                                                    <span className="text-base text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>') }} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </motion.section>
  );
}
