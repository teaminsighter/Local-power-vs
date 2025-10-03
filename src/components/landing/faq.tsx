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
    id: "power-cut",
    question: "What happens if there's a power cut?",
    answer: "Your SOLARWATT system provides reliable backup power. It automatically switches over in less than 20 milliseconds, keeping your lights on and critical appliances like your fridge and Wi-Fi running seamlessly."
  },
  {
    id: "add-batteries",
    question: "Can I add more batteries later if my energy needs increase?",
    answer: "Absolutely. The SOLARWATT Battery vision is a modular system. You can start with as little as 5.2 kWh of storage and easily expand in 2.6 kWh increments up to 18.2 kWh as your family or energy usage grows."
  },
  {
    id: "warranty-works",
    question: "How does the 30-year warranty actually work?",
    answer: "It's an all-inclusive warranty. For 30 years, we guarantee both the product against defects and its performance (to at least 87% of its original output). If a valid claim is made, we cover all costs for repair or replacement, including transport and labor. There are no hidden fees."
  },
  {
    id: "system-safety",
    question: "Is the system safe to install in my home?",
    answer: "Safety is our top priority. Our batteries use LiFePO4 chemistry, the safest on the market, and are certified to the highest European and Irish safety and fire standards (including UL 9540A). This gives you complete peace of mind."
  },
  {
    id: "ev-charging",
    question: "Can I charge my electric vehicle with this system?",
    answer: "Yes. The system is designed for EV integration. The SOLARWATT Manager can intelligently schedule your car to charge using surplus solar energy, making your driving cheaper and greener."
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
