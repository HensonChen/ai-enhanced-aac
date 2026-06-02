import type { GeneratedImage, ImageGenerator } from "./types";

export class FineTunedGenerator implements ImageGenerator {
  name = "finetuned";
  supports = { svg: false, animation: false, batchGenerate: true };

  async generate(): Promise<GeneratedImage> {
    throw new Error("FineTunedGenerator is not yet implemented. Set IMAGE_PROVIDER=dalle for the MVP.");
  }
}
