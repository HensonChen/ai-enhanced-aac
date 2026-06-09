import { NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { getOpenAIClient } from "@/lib/openai";
import { buildModifySystemPrompt, buildModifyUserPrompt } from "@/lib/prompts";
import { generatedVocabResponseSchema, modifyVocabRequestSchema } from "@/lib/validation";
import { inferRoleFromCategory } from "@/lib/roleUtils";

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
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildModifySystemPrompt() },
        { role: "user", content: buildModifyUserPrompt(instruction, currentItems, selectedItems, context) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const generated = generatedVocabResponseSchema.parse(
      JSON.parse(completion.choices[0]?.message?.content ?? "{}")
    );

    const items: VocabularyItem[] = generated.items.map((item, index) => ({
      id: `mod-${Date.now()}-${index}-${item.word.replace(/\s+/g, "-")}`,
      ...item,
      role: item.role ?? inferRoleFromCategory(item.category, item.word),
      imageUrl: "[message]",
      imageSource: "emoji",
      imageFormat: "png",
      isAnimated: false,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Vocabulary modification failed:", error);
    return NextResponse.json({ error: "Failed to modify vocabulary" }, { status: 500 });
  }
}
