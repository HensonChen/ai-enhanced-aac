import type { ImageProvider } from "@/types";
import { AIImageGenerator } from "./aiimage";
import { FineTunedGenerator } from "./finetuned";
import { IconlyGenerator } from "./iconly";
import { MagnificGenerator } from "./magnific";
import type { ImageGenerator } from "./types";

export function createImageGenerator(provider: ImageProvider = "gpt-image-mini"): ImageGenerator {
  switch (provider) {
    case "magnific":
      return new MagnificGenerator();
    case "iconly":
      return new IconlyGenerator();
    case "finetuned":
      return new FineTunedGenerator();
    case "gpt-image-mini":
    default:
      return new AIImageGenerator();
  }
}

export type { GeneratedImage, ImageGenerator } from "./types";
