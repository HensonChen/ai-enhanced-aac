import { getOpenAIClient } from "../openai";
import { ImageGenerationError } from "./errors";
import type { GeneratedImage, ImageGenerator } from "./types";

export class AIImageGenerator implements ImageGenerator {
  name = "gpt-image-mini";
  supports = { svg: false, animation: false, batchGenerate: false };

  async generate(word: string, context?: string, instruction?: string): Promise<GeneratedImage> {
    const client = getOpenAIClient();
    if (!client) throw new ImageGenerationError("OpenAI client not configured");

    const prompt = `Simple, child-friendly AAC pictogram of "${word}". Flat design, bold outlines, bright colors, white background, no text, suitable for children aged 3-12. Context: ${context ?? "AAC communication board"}.${instruction ? ` Instruction: ${instruction}.` : ""}`;

    let result;
    try {
      result = await client.images.generate({
        model: "gpt-image-1-mini",
        prompt,
        size: "1024x1024",
        quality: "low",
        n: 1,
      });
    } catch (error) {
      throw new ImageGenerationError("Image generation declined or failed", { cause: error });
    }

    const dataObj = result.data?.[0];
    if (!dataObj) throw new ImageGenerationError("Image generation returned no data");

    const url = dataObj.url || (dataObj.b64_json ? `data:image/png;base64,${dataObj.b64_json}` : null);
    if (!url) throw new ImageGenerationError("Image generation returned no image URL");

    return { url, source: "gpt-image-mini", format: "png", isAnimated: false };
  }
}
