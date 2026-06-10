import { z } from "zod";
import { COMPLEXITY_LIMITS } from "./constants";

export const complexitySchema = z.object({
  level: z.enum(["basic", "intermediate", "advanced"]),
  maxButtons: z.number().int().min(COMPLEXITY_LIMITS.maxButtons.min).max(COMPLEXITY_LIMITS.maxButtons.max),
  maxWordsPerPhrase: z.number().int().min(COMPLEXITY_LIMITS.maxWordsPerPhrase.min).max(COMPLEXITY_LIMITS.maxWordsPerPhrase.max),
});

export const generatedVocabItemSchema = z.object({
  word: z.string().min(1).max(40),
  phrase: z.string().min(1).max(120),
  category: z.enum(["verb", "noun", "descriptor", "emotion", "social"]),
  role: z.enum(["subject", "verb", "object"]).optional(),
  isAbstract: z.boolean(),
  type: z.enum(["word", "phrase"]),
  imageInstruction: z.string().max(500).optional(),
});

export const generatedVocabResponseSchema = z.object({
  items: z.array(generatedVocabItemSchema).min(1).max(COMPLEXITY_LIMITS.maxButtons.max),
});

export const generateVocabRequestSchema = z.object({
  context: z.string().min(3).max(800),
  complexitySettings: complexitySchema,
  locale: z.string().min(2).max(10).default("en"),
});

const currentImageSchema = z.object({
  imageUrl: z.string(),
  imageSource: z.enum(["arasaac", "gpt-image-mini", "magnific", "iconly", "finetuned", "gif", "emoji"]).optional(),
  imageFormat: z.enum(["png", "svg", "gif", "webp"]).optional(),
  isAnimated: z.boolean().optional(),
});

export const resolveImageRequestSchema = z.object({
  word: z.string().min(1).max(80),
  isAbstract: z.boolean().default(false),
  context: z.string().max(800).optional(),
  locale: z.string().min(2).max(10).default("en"),
  provider: z.enum(["gpt-image-mini", "magnific", "iconly", "finetuned"]).optional(),
  forceGenerate: z.boolean().default(false),
  instruction: z.string().max(500).optional(),
  currentImage: currentImageSchema.optional(),
});

const vocabReferenceSchema = z.object({
  word: z.string(),
  phrase: z.string(),
  category: z.enum(["verb", "noun", "descriptor", "emotion", "social"]),
  role: z.enum(["subject", "verb", "object"]),
  imageUrl: z.string().optional(),
  imageSource: z.string().optional(),
  imageFormat: z.string().optional(),
  isAnimated: z.boolean().optional(),
  imageInstruction: z.string().optional(),
});

export const modifyVocabRequestSchema = z.object({
  instruction: z.string().min(1).max(500),
  currentItems: z.array(vocabReferenceSchema),
  selectedItems: z.array(vocabReferenceSchema).default([]),
  context: z.string().max(800).default(""),
});
