"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { pushToDataLayer } from "@/lib/gtm";

const faqs = [
  {
    id: "actual-savings",
    question: "How much will I actually save?",
    answer: "We model your last 12 months' kWh and tariff to project self-consumption, export credits, and payback (typically 6–9 years for €2,300+/yr users)."
  },
  {
    id: "upfront-money",
    question: "Do I need money upfront?",
    answer: "No. We offer 0% upfront options. SEAI grant (up to €1,800) is applied in your proposal."
  },
  {
    id: "grants-setup",
    question: "Who handles grants and export setup?",
    answer: "We do. SEAI paperwork, NC6, commissioning, smart-meter pairing, and CEG registration—and we verify your first export credit on the bill."
  },
  {
    id: "planning-permission",
    question: "Is planning permission required?",
    answer: "Rooftop PV is generally exempt (outside specific safeguarding zones). We run checks and handle any exceptions."
  },
  {
    id: "blackout-power",
    question: "Will the lights stay on in a blackout?",
    answer: "Yes—on backed-up circuits. Our battery provides ~20 ms switchover for essentials (e.g., lights, Wi-Fi, fridge)."
  },
  {
    id: "battery-safety",
    question: "How safe is the battery?",
    answer: "LiFePO₄ chemistry (non-flammable, stable). Tested 10,000+ cycles @ 90% DoD, >95% round-trip efficiency, with a 12-year warranty."
  },
  {
    id: "panel-lifespan",
    question: "How long do panels last?",
    answer: "German glass–glass modules carry a 30-year product & performance warranty and are built for Irish weather extremes."
  },
  {
    id: "home-appearance",
    question: "Will it look neat on my home?",
    answer: "Yes. We design for roof symmetry, hidden conduit, labeled boards, and provide a visual mockup before install."
  },
  {
    id: "smart-meter-tariff",
    question: "Does it work with my smart meter and tariff?",
    answer: "Absolutely. The system is smart-meter native. Our app automates night-rate charging and tracks export credits."
  },
  {
    id: "system-size",
    question: "What size system do I need?",
    answer: "We right-size from your usage profile: typically 4–8 kWp with 5.2–18.2 kWh battery, tuned to evening peaks and EV/heat pump needs."
  },
  {
    id: "installation-timeline",
    question: "What's the installation timeline?",
    answer: "Typical flow: remote survey → grant/NC6 filing (Day 3–5) → install & commissioning (Day 10–14) → app live → first credit confirmed next billing cycle."
  },
  {
    id: "maintenance-required",
    question: "How much maintenance is required?",
    answer: "Minimal. No routine servicing for panels; remote monitoring flags issues. You get seasonal optimisation check-ins."
  },
  {
    id: "irish-weather",
    question: "Do panels work in Irish winters and cloudy days?",
    answer: "Yes. Panels produce in low light; bifacial TOPCon boosts yield. Note: moonlight capture is a small trickle—not a savings driver."
  },
  {
    id: "something-breaks",
    question: "What if something breaks? Who do I call?",
    answer: "One brand, one warranty, one Irish team. No multi-vendor runaround—we own the outcome end-to-end."
  },
  {
    id: "ev-hot-water",
    question: "Can you integrate EV charging and hot water?",
    answer: "Yes. EV-ready by design. We'll recommend a diverter only if it beats exporting at your CEG rate."
  }
];

export function Faq() {
  const handleFaqClick = (question: string) => {
    pushToDataLayer('select_content', {
      content_type: 'faq_question',
      item_id: question,
    });
  };

  return (
    <motion.section 
        className="w-full py-12 md:py-24 bg-secondary/50"
        id="faq"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
    >
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Clearing Up Your Questions</h2>
            <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl/relaxed">
              We've answered some of the most common questions below. If you don't find your answer here, feel free to reach out to our team.
            </p>
        </div>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <AccordionTrigger 
                className="text-left text-lg font-bold px-6 py-4 group faq-trigger"
                id={`faq-trigger-${faq.id}`}
                onClick={() => handleFaqClick(faq.question)}
                suppressHydrationWarning
              >
                  <span className="flex-1">{faq.question}</span>
                  <Plus className="h-6 w-6 shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]:hidden text-primary" />
                  <Minus className="h-6 w-6 shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]:block hidden text-primary" />
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground px-6 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}
