"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ProcessCta() {
    const scrollToConsultation = () => {
        document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <motion.section
            className="w-full py-12 md:py-24 bg-secondary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
        >
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                        Ready to Take the First Step?
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        You've seen how simple our process is. Let's get your personalized consultation on the calendar. It's free, there's no obligation, and it's the first step to significant savings.
                    </p>
                    <div className="mt-8">
                        <Button
                            onClick={scrollToConsultation}
                            size="lg"
                            className="font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg cta-button"
                            id="process-cta-button"
                        >
                            Book My Free Consultation
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

// Named export for backward compatibility
export { ProcessCta };
