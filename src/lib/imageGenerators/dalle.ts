import { getOpenAIClient } from "../openai";
import { emojiFallbackImage } from "./fallbacks";
import type { GeneratedImage, ImageGenerator } from "./types";

export class DalleGenerator implements ImageGenerator {
  name = "dalle";
  supports = { svg: false, animation: false, batchGenerate: false };

  async generate(word: string, context?: string): Promise<GeneratedImage> {
    const client = getOpenAIClient();
    if (!client) return emojiFallbackImage(word);

    const prompt = `Simple, child-friendly AAC pictogram of "${word}". Flat design, bold outlines, bright colors, white background, no text, suitable for children aged 3-12. Context: ${context ?? "AAC communication board"}.`;
    const result = await client.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = result.data?.[0]?.url;
    if (!url) return emojiFallbackImage(word);
    return { url, source: "dalle", format: "png", isAnimated: false };
  }
}
