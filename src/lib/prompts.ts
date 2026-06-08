import type { ComplexitySettings } from "@/types";

export function buildVocabSystemPrompt() {
  return `You generate AAC vocabulary for minimally-speaking children with Autism Spectrum Disorder. Return only valid JSON with an "items" array.
Each item must include: word, phrase, category, isAbstract, and type.
category must be one of: verb, noun, descriptor, emotion, social.
type must be "word" or "phrase".
Use simple, concrete, age-appropriate language. Include objects in the environment, possible feelings, actionable responses, and descriptors. Mark emotions, sensations, time, and other abstract concepts as isAbstract: true. Never include unsafe, adult, shaming, frightening, or medically directive content.`;
}

export function buildVocabUserPrompt(context: string, complexity: ComplexitySettings, locale = "en") {
  return `Context: ${context}
Language/locale: ${locale}
Complexity level: ${complexity.level}
Max buttons: ${complexity.maxButtons}
Max words per phrase: ${complexity.maxWordsPerPhrase}

Complexity rules:
- basic: mostly complete phrases, very simple vocabulary
- intermediate: mix of individual words and phrases
- advanced: more individual word tokens for free composition, nuanced vocabulary

You must generate exactly ${complexity.maxButtons} vocabulary items. Every phrase must be ${complexity.maxWordsPerPhrase} words or fewer unless the phrase would become grammatically confusing. Output JSON only in this shape:
{"items":[{"word":"headphones","phrase":"I need headphones","category":"noun","isAbstract":false,"type":"phrase"}]}`;
}
