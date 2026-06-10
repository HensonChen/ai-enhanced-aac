import { NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { getOpenAIClient } from "@/lib/openai";
import { buildVocabSystemPrompt, buildVocabUserPrompt } from "@/lib/prompts";
import { FALLBACK_EMOJIS } from "@/lib/constants";
import { generateVocabRequestSchema, generatedVocabResponseSchema } from "@/lib/validation";
import { inferRoleFromCategory } from "@/lib/roleUtils";

function fallbackItems(context: string, maxButtons: number): VocabularyItem[] {
  const lower = context.toLowerCase();
  const grocery = lower.includes("grocery") || lower.includes("store");
  const bedtime = lower.includes("bed") || lower.includes("sleep");
  const playground = lower.includes("play") || lower.includes("park");
  const base = grocery ? [["grocery store", "We are at the grocery store", "noun", "🛒", false, "phrase"], ["loud", "It is loud", "descriptor", "🔊", true, "word"], ["headphones", "I need headphones", "noun", "🎧", false, "phrase"], ["go home", "I want to go home", "verb", "🏠", false, "phrase"]]
    : bedtime ? [["bedtime", "It is bedtime", "noun", "🌙", true, "phrase"], ["sleep", "I am ready to sleep", "verb", "😴", false, "phrase"], ["book", "I want a book", "noun", "📖", false, "phrase"], ["hug", "I need a hug", "social", "🤗", true, "phrase"]]
      : playground ? [["playground", "I am at the playground", "noun", "🛝", false, "phrase"], ["play", "I want to play", "verb", "🧸", false, "word"], ["my turn", "It is my turn", "social", "🔄", false, "phrase"], ["water", "I need water", "noun", "💧", false, "phrase"]]
        : [["help", "I need help", "social", "🙋", false, "phrase"], ["stop", "Please stop", "verb", "🛑", false, "phrase"], ["quiet", "I need quiet", "descriptor", "🤫", true, "word"], ["okay", "I feel okay", "social", "👍", false, "phrase"]];
  const universal = [["happy", "I feel happy", "emotion", "😊", true, "phrase"], ["mad", "I am mad", "emotion", "😡", true, "phrase"], ["tired", "I am tired", "emotion", "🥱", true, "phrase"], ["help", "I need help", "social", "🙋", false, "phrase"], ["okay", "I feel okay", "social", "👍", false, "phrase"], ["quiet", "I need quiet", "descriptor", "🤫", true, "word"], ["break", "I need a break", "verb", "🛑", true, "phrase"], ["wait", "Please wait", "social", "⏰", true, "phrase"]];
  return [...base, ...universal].slice(0, maxButtons).map(([word, , category, emoji, isAbstract, type], index) => {
    const cat = category as VocabularyItem["category"];
    return { id: `fallback-${index}-${String(word).replace(/\s+/g, "-")}`, word: String(word), phrase: String(word), category: cat, role: inferRoleFromCategory(cat, String(word)), imageUrl: String(emoji ?? FALLBACK_EMOJIS.help), imageSource: "emoji", imageFormat: "png", isAbstract: Boolean(isAbstract), isAnimated: false, type: type as VocabularyItem["type"] };
  });
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
    const items: VocabularyItem[] = generated.items.slice(0, complexitySettings.maxButtons).map((item, index) => ({ id: `${Date.now()}-${index}-${item.word.replace(/\s+/g, "-")}`, ...item, phrase: item.word, role: item.role ?? inferRoleFromCategory(item.category, item.word), imageUrl: "[message]", imageSource: "emoji", imageFormat: "png", isAnimated: false }));
    return NextResponse.json({ board: { id: crypto.randomUUID(), context, timestamp: Date.now(), items, complexitySettings, isDemo: false }, usedFallback: false });
  } catch (error) {
    console.error("Vocabulary generation failed", error);
    return NextResponse.json({ board: { id: crypto.randomUUID(), context, timestamp: Date.now(), items: fallbackItems(context, complexitySettings.maxButtons), complexitySettings, isDemo: false }, usedFallback: true });
  }
}
