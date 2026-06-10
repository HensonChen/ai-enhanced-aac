import type { GeneratedImage, ImageGenerator } from "./types";

export class FineTunedGenerator implements ImageGenerator {
  name = "finetuned";
  supports = { svg: false, animation: false, batchGenerate: true };

  async generate(word: string, context?: string, instruction?: string): Promise<GeneratedImage> {
    throw new Error("FineTunedGenerator is not yet implemented. Set IMAGE_PROVIDER=gpt-image-mini for the MVP.");
  }
}
