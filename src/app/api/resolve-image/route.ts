import { NextResponse } from "next/server";
import { findArasaacImage } from "@/lib/arasaac";
import { createImageGenerator } from "@/lib/imageGenerators";
import { curatedAbstractAnimation, emojiFallbackImage } from "@/lib/imageGenerators/fallbacks";
import type { GeneratedImage } from "@/lib/imageGenerators/types";
import { isUsableImageUrl } from "@/lib/imageUtils";
import { resolveImageRequestSchema } from "@/lib/validation";
import type { ImageProvider } from "@/types";

async function resolveForceGenerateFallback(
  word: string,
  locale: string,
  currentImage?: { imageUrl: string; imageSource?: GeneratedImage["source"]; imageFormat?: GeneratedImage["format"]; isAnimated?: boolean },
): Promise<GeneratedImage> {
  if (currentImage && isUsableImageUrl(currentImage.imageUrl, currentImage.imageSource)) {
    return {
      url: currentImage.imageUrl,
      source: currentImage.imageSource ?? "arasaac",
      format: currentImage.imageFormat ?? "png",
      isAnimated: currentImage.isAnimated ?? false,
    };
  }

  const arasaacImage = await findArasaacImage(word, locale);
  if (arasaacImage) return arasaacImage;

  const curated = curatedAbstractAnimation(word);
  if (curated) return curated;

  return emojiFallbackImage(word);
}

export async function POST(request: Request) {
  const parsed = resolveImageRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const { word, context, locale, forceGenerate, instruction, currentImage } = parsed.data;
  const provider = (parsed.data.provider ?? process.env.IMAGE_PROVIDER ?? "gpt-image-mini") as ImageProvider;

  try {
    if (!forceGenerate) {
      // 1. Look up ARASAAC first
      const arasaacImage = await findArasaacImage(word, locale);
      if (arasaacImage) return NextResponse.json(arasaacImage);

      // 2. Look up curated GIFs second
      const curated = curatedAbstractAnimation(word);
      if (curated) return NextResponse.json(curated);
    }

    const generated = await createImageGenerator(provider).generate(word, context, instruction);
    return NextResponse.json(generated);
  } catch (error) {
    console.error("Image resolution failed", error);

    if (forceGenerate) {
      const fallback = await resolveForceGenerateFallback(word, locale, currentImage);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(emojiFallbackImage(word));
  }
}
