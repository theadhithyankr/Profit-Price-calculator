'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting pricing strategies based on similar products and market trends.
 *
 * - suggestPricingStrategies - A function that takes product information as input and returns pricing suggestions.
 * - SuggestPricingStrategiesInput - The input type for the suggestPricingStrategies function.
 * - SuggestPricingStrategiesOutput - The return type for the suggestPricingStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPricingStrategiesInputSchema = z.object({
  productDescription: z
    .string()
    .describe('Detailed description of the product, including features and benefits.'),
  basePrice: z.number().describe('The base cost of the product.'),
  packagingCost: z.number().describe('The cost of packaging the product.'),
  deliveryCharge: z.number().describe('The delivery charge for the product.'),
  numberOfProducts: z.number().describe('The number of products being sold.'),
  desiredProfitPerProduct: z.number().describe('The desired profit per product.'),
});
export type SuggestPricingStrategiesInput = z.infer<
  typeof SuggestPricingStrategiesInputSchema
>;

const SuggestPricingStrategiesOutputSchema = z.object({
  pricingSuggestion: z
    .string()
    .describe('AI-generated suggestions for pricing strategies.'),
});
export type SuggestPricingStrategiesOutput = z.infer<
  typeof SuggestPricingStrategiesOutputSchema
>;

export async function suggestPricingStrategies(
  input: SuggestPricingStrategiesInput
): Promise<SuggestPricingStrategiesOutput> {
  return suggestPricingStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricingStrategiesPrompt',
  input: {schema: SuggestPricingStrategiesInputSchema},
  output: {schema: SuggestPricingStrategiesOutputSchema},
  prompt: `You are a pricing strategy expert. Analyze the product information and suggest effective pricing strategies considering similar products and market trends.

Product Description: {{{productDescription}}}
Base Price: {{{basePrice}}}
Packaging Cost: {{{packagingCost}}}
Delivery Charge: {{{deliveryCharge}}}
Number of Products: {{{numberOfProducts}}}
Desired Profit per product: {{{desiredProfitPerProduct}}}

Consider these factors when making your suggestions:
- Pricing of similar products in the market.
- Current market trends.
- The product's unique value proposition.
- Profit margins and competitor pricing.

Provide a detailed suggestion for the user to consider when pricing their product.
`,
});

const suggestPricingStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestPricingStrategiesFlow',
    inputSchema: SuggestPricingStrategiesInputSchema,
    outputSchema: SuggestPricingStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
