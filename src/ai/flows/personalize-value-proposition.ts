'use server';

/**
 * @fileOverview A Genkit flow that personalizes the value proposition based on user input and location.
 *
 * - personalizeValueProposition - A function that personalizes the value proposition.
 * - PersonalizeValuePropositionInput - The input type for the personalizeValueProposition function.
 * - PersonalizeValuePropositionOutput - The return type for the personalizeValueProposition function.
 */

import { z } from 'zod';

// Temporarily disabled genkit until dependencies are properly installed
// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

const PersonalizeValuePropositionInputSchema = z.object({
  location: z.string().describe('The user’s location.'),
  roofSize: z.number().describe('The size of the user’s roof in square meters.'),
  energyConsumption: z.number().describe('The user’s average monthly energy consumption in kWh.'),
});
export type PersonalizeValuePropositionInput = z.infer<typeof PersonalizeValuePropositionInputSchema>;

const PersonalizeValuePropositionOutputSchema = z.object({
  personalizedValueProposition: z
    .string()
    .describe('A personalized value proposition highlighting the most relevant benefits for the user.'),
});
export type PersonalizeValuePropositionOutput = z.infer<typeof PersonalizeValuePropositionOutputSchema>;

// Temporarily disabled genkit flows - using fallback implementation
// const prompt = ai.definePrompt({...});
// const personalizeValuePropositionFlow = ai.defineFlow({...});

export async function personalizeValueProposition(
  input: PersonalizeValuePropositionInput
): Promise<PersonalizeValuePropositionOutput> {
    // Fallback implementation while genkit is not configured
    console.log('Using fallback personalization for:', input.location);
    
    const savings = Math.round(input.energyConsumption * 0.15 * 12); // Estimated annual savings
    const systemSize = Math.round(input.roofSize * 0.2); // Estimated system size in kW
    
    return {
        personalizedValueProposition: `Thank you for providing your details for your property in ${input.location}. 
        
Based on your roof size of ${input.roofSize}m² and monthly energy consumption of ${input.energyConsumption}kWh, we estimate that a ${systemSize}kW SOLARWATT solar system could save you approximately €${savings} annually on your electricity bills.

With Ireland's SEAI grant covering up to €2,400 of your installation costs, and our team handling all the paperwork, switching to solar has never been easier. SOLARWATT panels come with an industry-leading 30-year warranty and are designed to withstand Irish weather conditions.

For properties in ${input.location}, solar installations typically pay for themselves within 6-8 years, after which you'll enjoy decades of free, clean energy. Our Battery Vision storage system can further maximize your savings by storing excess energy for use during peak hours.

Ready to take the next step? Contact our certified installers for a detailed site assessment and personalized quote. We'll show you exactly how much you can save with a solar system tailored to your home.`
    };
}
