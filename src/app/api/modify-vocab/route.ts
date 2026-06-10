import { NextResponse } from "next/server";
import type { VocabularyItem } from "@/types";
import { getOpenAIClient } from "@/lib/openai";
import { isModelReadableImage } from "@/lib/imageUtils";
import { buildModifySystemPrompt, buildModifyUserPrompt } from "@/lib/prompts";
import { generatedVocabResponseSchema, modifyVocabRequestSchema } from "@/lib/validation";
import { inferRoleFromCategory } from "@/lib/roleUtils";

function getRefusal(completion: { choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }> }): string | null {
  const message = completion.choices?.[0]?.message;
  if (message?.refusal) return message.refusal;
  if (message?.content == null) return "Model returned no content.";
  return null;
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

  let result: unknown = null;
  let completion: Awaited<ReturnType<typeof client.chat.completions.create>> | null = null;

  try {
    const userText = buildModifyUserPrompt(instruction, currentItems, selectedItems, context);
    const selectedImageContent = selectedItems
      .filter((item) => isModelReadableImage(item.imageUrl))
      .flatMap((item) => [
        { type: "text" as const, text: `Selected vocab image for "${item.word}" from ${item.imageSource ?? "unknown source"}:` },
        { type: "image_url" as const, image_url: { url: item.imageUrl as string } },
      ]);

    const attempts = [
      { soften: false, includeImages: true, label: "default" },
      // { soften: true, includeImages: true, label: "softened-prompt" },
      { soften: false, includeImages: false, label: "no-image" },
      { soften: true, includeImages: false, label: "softened-no-image" },
    ];

    let refusal: string | null = null;

    for (const attempt of attempts) {
      const userContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
        { type: "text", text: userText },
      ];
      if (attempt.includeImages) userContent.push(...selectedImageContent);

      console.log(`=== SENDING TO AI (${attempt.label}) ===`);
      console.log("System Prompt:\n", buildModifySystemPrompt(attempt.soften));
      console.log("User Prompt:\n", userText);
      if (attempt.includeImages) {
        const loggedImageContent = selectedImageContent.map((c) => {
          if (c.type === "image_url" && c.image_url.url.startsWith("data:image/")) {
            const match = c.image_url.url.match(/^data:(image\/[a-zA-Z+.-]+);base64,/);
            return {
              ...c,
              image_url: { ...c.image_url, url: `******(${match ? match[1] : "image"})******` },
            };
          }
          return c;
        });
        console.log("Selected Image Content:\n", JSON.stringify(loggedImageContent, null, 2));
      }

      completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: buildModifySystemPrompt(attempt.soften) },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      console.log("=== AI RESPONSE RAW ===");
      console.log(completion.choices[0]?.message);

      refusal = getRefusal(completion);
      if (!refusal) break;

      console.warn(`modify-vocab refused on attempt "${attempt.label}":`, refusal);
    }

    if (refusal) {
      return NextResponse.json(
        {
          error:
            "The AI declined to modify this board. This sometimes happens with certain instructions or images. Try rephrasing your request, removing the selected image, or being more specific about the words you want.",
          reason: "ai_refusal",
        },
        { status: 422 },
      );
    }

    result = JSON.parse(completion!.choices[0]?.message?.content ?? "{}");
    const generated = generatedVocabResponseSchema.parse(result);

    const currentByWord = new Map(currentItems.map((item) => [item.word.toLowerCase(), item]));
    const refreshImageWords: string[] = [];

    const items: VocabularyItem[] = generated.items.map((item, index) => {
      const key = item.word.toLowerCase();
      const existing = currentByWord.get(key);
      const shouldRefreshImage = !!item.imageInstruction;
      if (shouldRefreshImage) refreshImageWords.push(item.word);
      if (shouldRefreshImage) console.log(item.imageInstruction);

      return {
        id: `mod-${Date.now()}-${index}-${item.word.replace(/\s+/g, "-")}`,
        ...item,
        phrase: item.word,
        role: item.role ?? inferRoleFromCategory(item.category, item.word),
        imageUrl: shouldRefreshImage ? `[${item.word}]` : existing?.imageUrl ?? `[${item.word}]`,
        imageSource: (shouldRefreshImage ? "emoji" : existing?.imageSource ?? "emoji") as VocabularyItem["imageSource"],
        imageFormat: (shouldRefreshImage ? "png" : existing?.imageFormat ?? "png") as VocabularyItem["imageFormat"],
        isAnimated: shouldRefreshImage ? false : existing?.isAnimated ?? false,
        imageInstruction: shouldRefreshImage ? item.imageInstruction : existing?.imageInstruction,
      };
    });

    return NextResponse.json({ items, refreshImageWords });
  } catch (error) {
    console.error("Vocabulary modification failed:", error);
    console.log("completion:", completion);
    console.log("result:", result);
    return NextResponse.json({ error: "Failed to modify vocabulary" }, { status: 500 });
  }
}
