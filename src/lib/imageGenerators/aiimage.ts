import { getOpenAIClient } from "../openai";
import { emojiFallbackImage } from "./fallbacks";
import type { GeneratedImage, ImageGenerator } from "./types";

export class AIImageGenerator implements ImageGenerator {
  name = "gpt-image-mini";
  supports = { svg: false, animation: false, batchGenerate: false };

  async generate(word: string, context?: string): Promise<GeneratedImage> {
    const client = getOpenAIClient();
    if (!client) return emojiFallbackImage(word);

    const prompt = `Simple, child-friendly AAC pictogram of "${word}". Flat design, bold outlines, bright colors, white background, no text, suitable for children aged 3-12. Context: ${context ?? "AAC communication board"}.`;
    const result = await client.images.generate({
      model: "gpt-image-1-mini",
      prompt,
      size: "1024x1024",
      quality: "low",
      n: 1,
    });

    // console.log(result);

    const dataObj = result.data?.[0];
    if (!dataObj) return emojiFallbackImage(word);
    const url = dataObj.url || (dataObj.b64_json ? `data:image/png;base64,${dataObj.b64_json}` : null);
    if (!url) return emojiFallbackImage(word);
    return { url, source: "gpt-image-mini", format: "png", isAnimated: false };
  }
}
