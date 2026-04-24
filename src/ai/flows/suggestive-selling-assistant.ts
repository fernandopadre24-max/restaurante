'use server';
/**
 * @fileOverview Um assistente de vendas baseado em IA que sugere pratos complementares, bebidas e oportunidades de upsell.
 *
 * - suggestSellingAssistant - Uma função que orquestra o processo de sugestão de vendas.
 * - SuggestiveSellingAssistantInput - O tipo de entrada para a função suggestSellingAssistant.
 * - SuggestiveSellingAssistantOutput - O tipo de retorno para a função suggestSellingAssistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestiveSellingAssistantInputSchema = z.object({
  orderedItems: z
    .array(z.string())
    .describe('Uma lista de nomes de itens que o cliente já pediu.'),
  popularItems: z
    .array(z.string())
    .describe('Uma lista de nomes de itens populares ou mais vendidos no restaurante para referência de upsell.'),
});
export type SuggestiveSellingAssistantInput = z.infer<
  typeof SuggestiveSellingAssistantInputSchema
>;

const SuggestiveSellingAssistantOutputSchema = z.object({
  complementaryDishes: z
    .array(z.string())
    .describe('Sugestões de pratos que complementam o pedido atual.'),
  idealDrinks: z
    .array(z.string())
    .describe('Sugestões de bebidas que harmonizam bem com os itens pedidos.'),
  upsellOpportunities: z
    .array(z.string())
    .describe(
      'Sugestões de oportunidades de upsell ou cross-sell (ex: sobremesas, acompanhamentos especiais, opções premium).'
    ),
  reasoning: z
    .string()
    .describe(
      'Uma breve explicação do porquê as sugestões foram feitas, em português.'
    ),
});
export type SuggestiveSellingAssistantOutput = z.infer<
  typeof SuggestiveSellingAssistantOutputSchema
>;

export async function suggestSellingAssistant(
  input: SuggestiveSellingAssistantInput
): Promise<SuggestiveSellingAssistantOutput> {
  return suggestiveSellingAssistantFlow(input);
}

const suggestiveSellingPrompt = ai.definePrompt({
  name: 'suggestiveSellingPrompt',
  input: {schema: SuggestiveSellingAssistantInputSchema},
  output: {schema: SuggestiveSellingAssistantOutputSchema},
  prompt: `Você é um assistente de vendas experiente para um restaurante no Brasil. Seu objetivo é sugerir pratos complementares, bebidas ideais e oportunidades de upsell personalizadas para um cliente, com base no pedido atual e em itens populares.

**Pedido Atual do Cliente:**
{{#each orderedItems}}
- {{{this}}}
{{/each}}

**Itens Populares no Restaurante (para contexto e upsell):**
{{#each popularItems}}
- {{{this}}}
{{/each}}

Analise o pedido atual do cliente e os itens populares para fornecer sugestões que aumentem o valor do pedido e melhorem a experiência gastronômica do cliente. Pense em combinações clássicas, contrastes de sabor e oportunidades de oferecer algo de maior valor ou um item que o cliente possa ter esquecido.

Seu retorno deve ser um objeto JSON no formato especificado no esquema de saída, com todas as respostas e o raciocínio em português do Brasil.`,
});

const suggestiveSellingAssistantFlow = ai.defineFlow(
  {
    name: 'suggestiveSellingAssistantFlow',
    inputSchema: SuggestiveSellingAssistantInputSchema,
    outputSchema: SuggestiveSellingAssistantOutputSchema,
  },
  async input => {
    const {output} = await suggestiveSellingPrompt(input);
    return output!;
  }
);
