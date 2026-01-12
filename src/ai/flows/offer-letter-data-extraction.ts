'use server';

/**
 * @fileOverview Extracts key information from an offer letter URL, such as compensation and start date.
 *
 * - offerLetterDataExtraction - A function that handles the extraction process.
 * - OfferLetterDataExtractionInput - The input type for the offerLetterDataExtraction function.
 * - OfferLetterDataExtractionOutput - The return type for the offerLetterDataExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {extractDataFromUrl} from '@/services/url-content-extractor';

const OfferLetterDataExtractionInputSchema = z.object({
  offerLetterUrl: z
    .string()
    .url()
    .describe('URL of the offer letter to extract data from.'),
});
export type OfferLetterDataExtractionInput = z.infer<
  typeof OfferLetterDataExtractionInputSchema
>;

const OfferLetterDataExtractionOutputSchema = z.object({
  compensation: z.string().describe('The compensation mentioned in the offer letter.'),
  startDate: z.string().describe('The start date mentioned in the offer letter.'),
});
export type OfferLetterDataExtractionOutput = z.infer<
  typeof OfferLetterDataExtractionOutputSchema
>;

export async function offerLetterDataExtraction(
  input: OfferLetterDataExtractionInput
): Promise<OfferLetterDataExtractionOutput> {
  return offerLetterDataExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'offerLetterDataExtractionPrompt',
  input: {schema: z.object({ offerLetterContent: z.string() })},
  output: {schema: OfferLetterDataExtractionOutputSchema},
  prompt: `You are an expert HR assistant. Extract the compensation and start date from the offer letter content.

Offer Letter Content: {{{offerLetterContent}}}`,
});

const offerLetterDataExtractionFlow = ai.defineFlow(
  {
    name: 'offerLetterDataExtractionFlow',
    inputSchema: OfferLetterDataExtractionInputSchema,
    outputSchema: OfferLetterDataExtractionOutputSchema,
  },
  async input => {
    const offerLetterContent = await extractDataFromUrl(input.offerLetterUrl);
    const {output} = await prompt({
      offerLetterContent,
    });
    return output!;
  }
);
