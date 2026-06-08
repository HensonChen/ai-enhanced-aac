import { NextResponse } from "next/server";
import { findArasaacImage } from "@/lib/arasaac";
import { createImageGenerator } from "@/lib/imageGenerators";
import { curatedAbstractAnimation, emojiFallbackImage } from "@/lib/imageGenerators/fallbacks";
import { resolveImageRequestSchema } from "@/lib/validation";
import type { ImageProvider } from "@/types";

export async function POST(request: Request) {
  const parsed = resolveImageRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const { word, context, locale } = parsed.data;
  const provider = (parsed.data.provider ?? process.env.IMAGE_PROVIDER ?? "gpt-image-mini") as ImageProvider;
  try {
    // 1. Look up ARASAAC first
    const arasaacImage = await findArasaacImage(word, locale);
    if (arasaacImage) return NextResponse.json(arasaacImage);

    // 2. Look up curated GIFs second
    const curated = curatedAbstractAnimation(word);
    if (curated) return NextResponse.json(curated);

    // 3. Fall back to AI image generation
    const generated = await createImageGenerator(provider).generate(word, context);
    return NextResponse.json(generated);
  } catch (error) {
    console.error("Image resolution failed", error);
    return NextResponse.json(emojiFallbackImage(word));
  }
}
