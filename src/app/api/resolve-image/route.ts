import { NextResponse } from "next/server";
import { findArasaacImage } from "@/lib/arasaac";
import { createImageGenerator } from "@/lib/imageGenerators";
import { curatedAbstractAnimation, emojiFallbackImage } from "@/lib/imageGenerators/fallbacks";
import { resolveImageRequestSchema } from "@/lib/validation";
import type { ImageProvider } from "@/types";

export async function POST(request: Request) {
  const parsed = resolveImageRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  const { word, isAbstract, context, locale } = parsed.data;
  const provider = (parsed.data.provider ?? process.env.IMAGE_PROVIDER ?? "dalle") as ImageProvider;
  try {
    if (!isAbstract) {
      const arasaacImage = await findArasaacImage(word, locale);
      if (arasaacImage) return NextResponse.json(arasaacImage);
    }
    if (isAbstract) {
      const curated = curatedAbstractAnimation(word);
      if (curated) return NextResponse.json(curated);
    }
    const generated = await createImageGenerator(provider).generate(word, context);
    return NextResponse.json(generated);
  } catch (error) {
    console.error("Image resolution failed", error);
    return NextResponse.json(emojiFallbackImage(word));
  }
}
