
'use server';

import { suggestPricingStrategies, type SuggestPricingStrategiesInput } from '@/ai/flows/suggest-pricing';

// Define a type that maps form field names to the AI flow input names.
// This makes the action more specific to our form.
export type SuggestionRequest = Omit<SuggestPricingStrategiesInput, 'desiredProfitPerProduct'> & {
  desiredProfit: number;
};

export async function getAiSuggestionAction(input: SuggestionRequest) {
  try {
    const result = await suggestPricingStrategies({
      ...input,
      desiredProfitPerProduct: input.desiredProfit, // Map form field to AI field
    });
    return { success: true, suggestion: result.pricingSuggestion };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get AI suggestion. ${errorMessage}` };
  }
}
