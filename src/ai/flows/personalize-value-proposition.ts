'use server';

/**
 * @fileOverview A Genkit flow that personalizes the value proposition based on user input and location.
 *
 * - personalizeValueProposition - A function that personalizes the value proposition.
 * - PersonalizeValuePropositionInput - The input type for the personalizeValueProposition function.
 * - PersonalizeValuePropositionOutput - The return type for the personalizeValueProposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
    name: 'personalizeValuePropositionPrompt',
    input: {schema: PersonalizeValuePropositionInputSchema},
    output: {schema: PersonalizeValuePropositionOutputSchema},
    prompt: `You are an expert solar energy consultant for Local Power, an Irish company.
  Given the user's location, roof size, and energy consumption, create a personalized, compelling value proposition for a SOLARWATT solar panel system.

  **User Details:**
  - Location: {{{location}}}
  - Roof Size: {{{roofSize}}} square meters
  - Average Monthly Energy Consumption: {{{energyConsumption}}} kWh

  **Instructions:**
  1.  **Acknowledge Input:** Start by acknowledging the user's provided information.
  2.  **Highlight Key Benefits:** Focus on the most relevant benefits based on their data. For high consumption, emphasize cost savings. For a large roof, emphasize maximizing energy generation.
  3.  **Incorporate Local Context:** Mention the importance of the SEAI grant for Irish homeowners and mention we handle the paperwork. Be specific about financial incentives if possible for their location (e.g., mentioning Dublin-specific benefits if the location is Dublin).
  4.  **Promote SOLARWATT Products:** Naturally weave in the advantages of SOLARWATT panels (30-year warranty, durability), Battery Vision (modular, safe LiFePO4), and the SOLARWATT Manager (smart energy control).
  5.  **Provide a Call to Action:** End with a clear call to action, encouraging them to proceed with a full consultation to get a precise quote.
  6.  **Tone:** Be professional, encouraging, and authoritative. The output should be a single block of text, well-formatted with paragraphs.`,
});

const personalizeValuePropositionFlow = ai.defineFlow(
    {
    name: 'personalizeValuePropositionFlow',
    inputSchema: PersonalizeValuePropositionInputSchema,
    outputSchema: PersonalizeValuePropositionOutputSchema,
    },
    async input => {
    const {output} = await prompt(input);
    return output!;
    }
);

export async function personalizeValueProposition(
  input: PersonalizeValuePropositionInput
): Promise<PersonalizeValuePropositionOutput> {
    try {
        const result = await personalizeValuePropositionFlow(input);
        if (!result) {
            throw new Error('AI returned no output.');
        }
        return result;
    } catch (error) {
        console.error('Error in personalizeValueProposition flow, returning fallback:', error);
        // Return a fallback response if the AI call fails for any reason.
        return {
            personalizedValueProposition: `Based on your roof size of ${input.roofSize}m² and energy consumption of ${input.energyConsumption}kWh, a solar installation offers significant savings. Our systems are designed to maximize your return on investment. To get a detailed breakdown of costs, savings, and available grants for your home in ${input.location}, please contact our team for a full consultation. We apologize, but our instant AI analysis is currently unavailable.`
        };
    }
}
