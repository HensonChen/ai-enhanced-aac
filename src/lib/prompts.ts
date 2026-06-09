import type { ComplexitySettings, VocabularyItem } from "@/types";

type ModifyPromptItem = Pick<VocabularyItem, "word" | "phrase" | "category" | "role"> & {
  imageUrl?: string;
  imageSource?: string;
};

export function buildVocabSystemPrompt() {
  return `You generate AAC vocabulary for minimally-speaking children with Autism Spectrum Disorder. Return only valid JSON with an "items" array.
Each item must include: word, phrase, category, role, isAbstract, and type.
The phrase must be exactly the same text as word. Do not make phrase a sentence.
category must be one of: verb, noun, descriptor, emotion, social.
role must be one of: subject, verb, object.
  - "subject": pronouns (I, you, he, she, we, they), people, social items expressing who is doing something
  - "verb": actions and verbs
  - "object": nouns that are objects/things, descriptors, locations, foods
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
- basic: very simple vocabulary
- intermediate: mix of common core and context-specific vocabulary
- advanced: more individual word tokens for free composition, nuanced vocabulary

You must generate exactly ${complexity.maxButtons} vocabulary items. Output JSON only in this shape:
{"items":[{"word":"headphones","phrase":"headphones","category":"noun","role":"object","isAbstract":false,"type":"word"}]}`;
}

export function buildModifySystemPrompt() {
  return `You modify AAC vocabulary boards for minimally-speaking children with Autism Spectrum Disorder based on caregiver instructions. Return only valid JSON with an "items" array containing the FULL modified board (not just changes).
Each item must include: word, phrase, category, role, isAbstract, and type.
The phrase must be exactly the same text as word. Do not make phrase a sentence.
category must be one of: verb, noun, descriptor, emotion, social.
role must be one of: subject, verb, object.
type must be "word" or "phrase".
Follow the caregiver's instruction precisely. You may add, remove, or modify items. If selected items include image context, use that visual information when deciding how to update the selected vocab or image concept. Keep the board age-appropriate, safe, and useful for AAC communication.`;
}

export function buildModifyUserPrompt(
  instruction: string,
  currentItems: ModifyPromptItem[],
  selectedItems: ModifyPromptItem[],
  context: string,
) {
  const currentBoard = JSON.stringify(currentItems.map((i) => ({ word: i.word, phrase: i.phrase, category: i.category, role: i.role, imageSource: i.imageSource })));
  const selectedContext = selectedItems.length > 0
    ? `\nThe caregiver selected these specific items as context for their request: ${JSON.stringify(selectedItems.map((i) => ({ word: i.word, category: i.category, role: i.role, imageSource: i.imageSource })))}`
    : "";

  return `Original situation context: ${context}
Current board items: ${currentBoard}${selectedContext}

Caregiver instruction: "${instruction}"

Return the complete modified board as JSON in this shape:
{"items":[{"word":"headphones","phrase":"headphones","category":"noun","role":"object","isAbstract":false,"type":"word"}]}`;
}
