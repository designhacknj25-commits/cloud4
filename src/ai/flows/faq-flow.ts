'use server';
/**
 * @fileOverview An AI flow to generate Frequently Asked Questions from student inquiries.
 * 
 * - generateFaqs - A function that takes student questions and returns a list of FAQs.
 * - GenerateFaqsInput - The input type for the generateFaqs function.
 * - GenerateFaqsOutput - The return type for the generateFaqs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the input: a list of questions.
const GenerateFaqsInputSchema = z.object({
  questions: z.array(z.string()).describe('A list of questions submitted by students.'),
});
export type GenerateFaqsInput = z.infer<typeof GenerateFaqsInputSchema>;


// Define the schema for a single FAQ item.
const FaqItemSchema = z.object({
    question: z.string().describe("The frequently asked question."),
    answer: z.string().describe("A clear and concise answer to the question.")
});

// Define the schema for the output: a list of FAQ items.
const GenerateFaqsOutputSchema = z.object({
  faqs: z.array(FaqItemSchema).describe('A list of generated frequently asked questions.'),
});
export type GenerateFaqsOutput = z.infer<typeof GenerateFaqsOutputSchema>;


/**
 * A wrapper function that executes the FAQ generation flow.
 * @param input The list of student questions.
 * @returns A promise that resolves to the generated list of FAQs.
 */
export async function generateFaqs(input: GenerateFaqsInput): Promise<GenerateFaqsOutput> {
  return generateFaqsFlow(input);
}


// Define the prompt for the AI model.
const prompt = ai.definePrompt({
  name: 'generateFaqsPrompt',
  input: { schema: GenerateFaqsInputSchema },
  output: { schema: GenerateFaqsOutputSchema },
  prompt: `You are an expert academic assistant responsible for helping a teacher manage student questions.
  
  You will be given a list of questions submitted by students. Your task is to analyze these questions and identify common themes or recurring inquiries.
  
  Based on your analysis, generate a list of Frequently Asked Questions (FAQs). For each FAQ, provide a clear, concise, and helpful answer.
  
  - Only generate FAQs for topics that seem to be of general interest or are asked multiple times in different ways.
  - Do not generate an FAQ for every single input question. Consolidate similar questions into a single FAQ.
  - If the list of questions is very diverse with no clear common themes, you can return an empty list of FAQs.
  - The tone of the answers should be helpful, polite, and professional.

  Here are the student questions:
  {{#each questions}}
  - "{{this}}"
  {{/each}}
  `,
});

// Define the main flow for generating FAQs.
const generateFaqsFlow = ai.defineFlow(
  {
    name: 'generateFaqsFlow',
    inputSchema: GenerateFaqsInputSchema,
    outputSchema: GenerateFaqsOutputSchema,
  },
  async (input) => {
    // If there are no questions, return an empty list.
    if (!input.questions || input.questions.length === 0) {
      return { faqs: [] };
    }

    const { output } = await prompt(input);
    return output || { faqs: [] };
  }
);
