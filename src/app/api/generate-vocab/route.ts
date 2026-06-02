import { NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { getOpenAIClient } from "@/lib/openai";
import { buildVocabSystemPrompt, buildVocabUserPrompt } from "@/lib/prompts";
import { FALLBACK_EMOJIS } from "@/lib/constants";
import { generateVocabRequestSchema, generatedVocabResponseSchema } from "@/lib/validation";

function fallbackItems(context: string, maxButtons: number): VocabularyItem[] {
  const lower = context.toLowerCase();
  const grocery = lower.includes("grocery") || lower.includes("store");
  const bedtime = lower.includes("bed") || lower.includes("sleep");
  const playground = lower.includes("play") || lower.includes("park");
  const base = grocery ? [["grocery store", "We are at the grocery store", "noun", "[cart]", false, "phrase"], ["loud", "It is loud", "descriptor", "[loud]", true, "word"], ["headphones", "I need headphones", "noun", "[headphones]", false, "phrase"], ["go home", "I want to go home", "verb", "[home]", false, "phrase"]]
    : bedtime ? [["bedtime", "It is bedtime", "noun", "[moon]", true, "phrase"], ["sleep", "I am ready to sleep", "verb", "[sleep]", false, "phrase"], ["book", "I want a book", "noun", "[book]", false, "phrase"], ["hug", "I need a hug", "social", "[hug]", true, "phrase"]]
    : playground ? [["playground", "I am at the playground", "noun", "[playground]", false, "phrase"], ["play", "I want to play", "verb", "[play]", false, "word"], ["my turn", "It is my turn", "social", "[turn]", false, "phrase"], ["water", "I need water", "noun", "[water]", false, "phrase"]]
    : [["help", "I need help", "social", "[help]", false, "phrase"], ["stop", "Please stop", "verb", "[stop]", false, "phrase"], ["quiet", "I need quiet", "descriptor", "[quiet]", true, "word"], ["okay", "I feel okay", "social", "[ok]", false, "phrase"]];
  const universal = [["happy", "I feel happy", "emotion", "[happy]", true, "phrase"], ["mad", "I am mad", "emotion", "[mad]", true, "phrase"], ["tired", "I am tired", "emotion", "[tired]", true, "phrase"], ["help", "I need help", "social", "[help]", false, "phrase"]];
  return [...base, ...universal].slice(0, maxButtons).map(([word, phrase, category, emoji, isAbstract, type], index) => ({ id: `fallback-${index}-${String(word).replace(/\s+/g, "-")}`, word: String(word), phrase: String(phrase), category: category as VocabularyItem["category"], imageUrl: String(emoji ?? FALLBACK_EMOJIS.help), imageSource: "emoji", imageFormat: "png", isAbstract: Boolean(isAbstract), isAnimated: false, type: type as VocabularyItem["type"] }));
}

export async function POST(request: Request) {
  const parsed = generateVocabRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const { context, complexitySettings, locale } = parsed.data;
  const client = getOpenAIClient();
  if (!client) return NextResponse.json({ board: { id: crypto.randomUUID(), context, timestamp: Date.now(), items: fallbackItems(context, complexitySettings.maxButtons), complexitySettings, isDemo: false }, usedFallback: true });
  try {
    const completion = await client.chat.completions.create({ model: "gpt-4o", messages: [{ role: "system", content: buildVocabSystemPrompt() }, { role: "user", content: buildVocabUserPrompt(context, complexitySettings, locale) }], response_format: { type: "json_object" }, temperature: 0.4 });
    const generated = generatedVocabResponseSchema.parse(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
    const items: VocabularyItem[] = generated.items.slice(0, complexitySettings.maxButtons).map((item, index) => ({ id: `${Date.now()}-${index}-${item.word.replace(/\s+/g, "-")}`, ...item, phrase: item.phrase.split(/\s+/).slice(0, complexitySettings.maxWordsPerPhrase).join(" "), imageUrl: "[message]", imageSource: "emoji", imageFormat: "png", isAnimated: false }));
    return NextResponse.json({ board: { id: crypto.randomUUID(), context, timestamp: Date.now(), items, complexitySettings, isDemo: false }, usedFallback: false });
  } catch (error) {
    console.error("Vocabulary generation failed", error);
    return NextResponse.json({ board: { id: crypto.randomUUID(), context, timestamp: Date.now(), items: fallbackItems(context, complexitySettings.maxButtons), complexitySettings, isDemo: false }, usedFallback: true });
  }
}
