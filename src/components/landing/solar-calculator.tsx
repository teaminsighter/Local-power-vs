"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { personalizeValueProposition } from '@/ai/flows/personalize-value-proposition';
import type { PersonalizeValuePropositionOutput } from '@/ai/flows/personalize-value-proposition';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { pushToDataLayer, getFirstAndLastName } from '@/lib/gtm';
import { handleFormSubmission } from '@/app/actions/submissionActions';
import { useState, useEffect } from 'react';
import { getOrSetUserId } from '@/lib/user-id';

const formSchema = z.object({
  location: z.string().min(2, { message: "Please enter a valid location (e.g., Dublin, Cork)." }),
  roofSize: z.coerce.number().positive({ message: "Roof size must be a positive number." }),
  energyConsumption: z.coerce.number().positive({ message: "Energy consumption must be a positive number." }),
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(7, { message: "Please enter a valid phone number." }).optional(),
});

type SolarCalculatorProps = {
  setResult: (result: PersonalizeValuePropositionOutput | null) => void;
  setLoading: (loading: boolean) => void;
};

export function SolarCalculator({ setResult, setLoading }: SolarCalculatorProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setUserId(getOrSetUserId());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      roofSize: undefined,
      energyConsumption: undefined,
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    
    // Smooth scroll to the results section which will appear
    setTimeout(() => {
        document.getElementById('personalized-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      // This function handles saving to Firestore and firing webhooks
      handleFormSubmission('calculator', values, userId);

      const result = await personalizeValueProposition({
        location: values.location,
        roofSize: values.roofSize,
        energyConsumption: values.energyConsumption,
      });
      setResult(result);
      
      const { firstName, lastName } = getFirstAndLastName(values.name);
      pushToDataLayer('generate_lead', {
        lead_type: 'solar_calculator',
        value: 1,
        currency: 'EUR',
        user_data: {
            email: values.email,
            phone_number: values.phone,
            first_name: firstName,
            last_name: lastName,
        }
      });


    } catch (error) {
      console.error("Error during calculation or submission:", error);
      toast({
        variant: "destructive",
        title: "An error occurred.",
        description: "Could not generate your report. Please check your details and try again.",
      });
    } finally {
      setLoading(false);
       setTimeout(() => {
        document.getElementById('personalized-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  return (
    <motion.section 
        id="calculator" 
        className="w-full py-12 md:py-24 bg-background"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
    >
      <div className="container px-4 md:px-6">
        <Card className="max-w-3xl mx-auto shadow-2xl border-primary/20 border-2">
          <CardHeader className="text-center p-8">
            <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get Your Instant Quote</CardTitle>
            <CardDescription className="md:text-xl/relaxed">Fill in your details below to see your personalized savings and get a quote from our experts.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="solar-calculator-form" suppressHydrationWarning>
                <div>
                    <h3 className="text-xl font-semibold text-center mb-4">System Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Your Location</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Dublin" {...field} id="calc-location" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="roofSize" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Roof Size (m²)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 50" {...field} id="calc-roof-size" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="energyConsumption" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base">Monthly kWh Usage</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 400" {...field} id="calc-energy-consumption" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-xl font-semibold text-center">Your Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">Full Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} id="calc-name" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="you@example.com" {...field} id="calc-email" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel className="text-base">Phone Number (Optional)</FormLabel>
                                <FormControl><Input type="tel" placeholder="087 123 4567" {...field} id="calc-phone" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>
                <Button type="submit" className="w-full font-bold text-xl bg-primary hover:bg-primary/90 text-primary-foreground cta-button" size="lg" id="calc-submit-button" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Calculating...' : 'Calculate Savings & Get Quote'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
