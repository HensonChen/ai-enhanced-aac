import { NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { getOpenAIClient } from "@/lib/openai";
import { buildModifySystemPrompt, buildModifyUserPrompt } from "@/lib/prompts";
import { generatedVocabResponseSchema, modifyVocabRequestSchema } from "@/lib/validation";
import { inferRoleFromCategory } from "@/lib/roleUtils";

function isModelReadableImage(value?: string) {
  return !!value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/"));
}

export async function POST(request: Request) {
  const parsed = modifyVocabRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { instruction, currentItems, selectedItems, context } = parsed.data;
  const client = getOpenAIClient();

  if (!client) {
    return NextResponse.json({ error: "AI service not configured. Set OPENAI_API_KEY." }, { status: 503 });
  }

  try {
    const userText = buildModifyUserPrompt(instruction, currentItems, selectedItems, context);
    const selectedImageContent = selectedItems
      .filter((item) => isModelReadableImage(item.imageUrl))
      .flatMap((item) => [
        { type: "text" as const, text: `Selected vocab image for "${item.word}" from ${item.imageSource ?? "unknown source"}:` },
        { type: "image_url" as const, image_url: { url: item.imageUrl as string } },
      ]);

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildModifySystemPrompt() },
        { role: "user", content: [{ type: "text", text: userText }, ...selectedImageContent] },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const generated = generatedVocabResponseSchema.parse(
      JSON.parse(completion.choices[0]?.message?.content ?? "{}")
    );

    const currentByWord = new Map(currentItems.map((item) => [item.word.toLowerCase(), item]));
    const selectedWords = new Set(selectedItems.map((item) => item.word.toLowerCase()));
    const refreshImageWords: string[] = [];

    const items: VocabularyItem[] = generated.items.map((item, index) => {
      const key = item.word.toLowerCase();
      const existing = currentByWord.get(key);
      const shouldRefreshImage = selectedWords.has(key) || !existing;
      if (shouldRefreshImage) refreshImageWords.push(item.word);

      return {
        id: `mod-${Date.now()}-${index}-${item.word.replace(/\s+/g, "-")}`,
        ...item,
        phrase: item.word,
        role: item.role ?? inferRoleFromCategory(item.category, item.word),
        imageUrl: shouldRefreshImage ? "[message]" : existing?.imageUrl ?? "[message]",
        imageSource: (shouldRefreshImage ? "emoji" : existing?.imageSource ?? "emoji") as VocabularyItem["imageSource"],
        imageFormat: (shouldRefreshImage ? "png" : existing?.imageFormat ?? "png") as VocabularyItem["imageFormat"],
        isAnimated: shouldRefreshImage ? false : existing?.isAnimated ?? false,
      };
    });

    return NextResponse.json({ items, refreshImageWords });
  } catch (error) {
    console.error("Vocabulary modification failed:", error);
    return NextResponse.json({ error: "Failed to modify vocabulary" }, { status: 500 });
  }
}
