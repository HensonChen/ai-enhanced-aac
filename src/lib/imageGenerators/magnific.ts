import type { GeneratedImage, ImageGenerator } from "./types";

export class MagnificGenerator implements ImageGenerator {
  name = "magnific";
  supports = { svg: true, animation: false, batchGenerate: false };

  async generate(word: string, context?: string, instruction?: string): Promise<GeneratedImage> {
    throw new Error("MagnificGenerator is not yet implemented. Set IMAGE_PROVIDER=gpt-image-mini for the MVP.");
  }
}
