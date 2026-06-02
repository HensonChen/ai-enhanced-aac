import type { GeneratedImage, ImageGenerator } from "./types";

export class MagnificGenerator implements ImageGenerator {
  name = "magnific";
  supports = { svg: true, animation: false, batchGenerate: false };

  async generate(): Promise<GeneratedImage> {
    throw new Error("MagnificGenerator is not yet implemented. Set IMAGE_PROVIDER=dalle for the MVP.");
  }
}
