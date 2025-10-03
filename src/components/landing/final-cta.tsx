"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { pushToDataLayer, getFirstAndLastName } from '@/lib/gtm';
import { handleFormSubmission } from '@/app/actions/submissionActions';
import { Loader2 } from 'lucide-react';
import { getOrSetUserId } from '@/lib/user-id';


const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(7, { message: "Please enter a valid phone number." }),
  message: z.string().optional(),
});

export function FinalCta() {
    const { toast } = useToast();
    const [userId, setUserId] = useState('');

    useEffect(() => {
        setUserId(getOrSetUserId());
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", phone: "", message: "" },
    });

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: imageContainerRef,
        offset: ['start end', 'end start']
    });
    const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await handleFormSubmission('quote', values, userId);

        if (result.success) {
            toast({
                title: "Quote Request Sent!",
                description: "Thank you! We've received your request and will be in touch with your detailed quote shortly.",
            });

            const { firstName, lastName } = getFirstAndLastName(values.name);
            pushToDataLayer('generate_lead', {
                lead_type: 'quote_request',
                value: 1,
                currency: 'EUR',
                user_data: {
                    email: values.email,
                    phone_number: values.phone,
                    first_name: firstName,
                    last_name: lastName,
                }
            });

            form.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: result.message || "Could not submit your request. Please try again later.",
            });
        }
    }

    return (
        <motion.section 
            id="final-cta" 
            className="w-full py-16 md:py-20 bg-primary/5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
        >
            <div className="container grid items-stretch justify-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-4 lg:flex lg:flex-col">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready for Your Personalised Quote?</h2>
                    <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl/relaxed">
                        You've seen the technology and the potential savings. The final step is to get a precise, no-obligation quote tailored to your home. Fill out the form, and our solar experts will get back to you with a detailed proposal.
                    </p>
                    <div ref={imageContainerRef} className="hidden lg:block pt-4 lg:flex-grow relative">
                      <div className="overflow-hidden rounded-xl shadow-2xl h-full">
                        <motion.div style={{ y }} className="h-full">
                            <Image src="https://placehold.co/600x400.png" alt="Happy family with solar panels" width={600} height={400} className="w-full h-full object-cover" data-ai-hint="family home solar" />
                        </motion.div>
                      </div>
                    </div>
                </div>
                <div className="w-full max-w-md mx-auto bg-card p-6 rounded-xl shadow-2xl border flex flex-col justify-center">
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" id="final-cta-form" suppressHydrationWarning>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} id="final-cta-name"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="you@example.com" {...field} id="final-cta-email"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Phone Number</FormLabel>
                                    <FormControl><Input type="tel" placeholder="087 123 4567" {...field} id="final-cta-phone"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">Your Message (Optional)</FormLabel>
                                    <FormControl><Textarea placeholder="Any specific questions or details about your home?" {...field} id="final-cta-message" rows={3}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground cta-button" size="lg" id="final-cta-submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {form.formState.isSubmitting ? 'Sending...' : 'Request My Free Quote'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </motion.section>
    );
}
