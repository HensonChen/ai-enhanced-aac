import { z } from "zod";

export const complexitySchema = z.object({
  level: z.enum(["basic", "intermediate", "advanced"]),
  maxButtons: z.number().int().min(4).max(20),
  maxWordsPerPhrase: z.number().int().min(2).max(8),
});

export const generatedVocabItemSchema = z.object({
  word: z.string().min(1).max(40),
  phrase: z.string().min(1).max(120),
  category: z.enum(["verb", "noun", "descriptor", "emotion", "social"]),
  isAbstract: z.boolean(),
  type: z.enum(["word", "phrase"]),
});

export const generatedVocabResponseSchema = z.object({
  items: z.array(generatedVocabItemSchema).min(1).max(20),
});

export const generateVocabRequestSchema = z.object({
  context: z.string().min(3).max(800),
  complexitySettings: complexitySchema,
  locale: z.string().min(2).max(10).default("en"),
});

export const resolveImageRequestSchema = z.object({
  word: z.string().min(1).max(80),
  isAbstract: z.boolean().default(false),
  context: z.string().max(800).optional(),
  locale: z.string().min(2).max(10).default("en"),
  provider: z.enum(["gpt-image-mini", "magnific", "iconly", "finetuned"]).optional(),
});
