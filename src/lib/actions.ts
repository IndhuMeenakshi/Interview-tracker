"use server";

import { offerLetterDataExtraction } from '@/ai/flows/offer-letter-data-extraction';
import { z } from 'zod';

const OfferLetterSchema = z.object({
  offerLetterUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

export type FormState = {
  data: {
    compensation: string;
    startDate: string;
  } | null;
  message: string;
}

export async function extractOfferInfo(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validatedFields = OfferLetterSchema.safeParse({
    offerLetterUrl: formData.get('offerLetterUrl'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      message: validatedFields.error.flatten().fieldErrors.offerLetterUrl?.[0] ?? 'Invalid input.',
    };
  }

  try {
    const result = await offerLetterDataExtraction({
      offerLetterUrl: validatedFields.data.offerLetterUrl,
    });
    return {
      data: result,
      message: 'success',
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      message: 'An error occurred while extracting information. Please check the URL and try again.',
    };
  }
}
