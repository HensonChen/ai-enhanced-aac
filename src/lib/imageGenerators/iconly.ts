import type { GeneratedImage, ImageGenerator } from "./types";

export class IconlyGenerator implements ImageGenerator {
  name = "iconly";
  supports = { svg: true, animation: true, batchGenerate: false };

  async generate(): Promise<GeneratedImage> {
    throw new Error("IconlyGenerator is not yet implemented. Set IMAGE_PROVIDER=dalle for the MVP.");
  }
}
