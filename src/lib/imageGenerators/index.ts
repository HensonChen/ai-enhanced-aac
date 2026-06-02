import type { ImageProvider } from "@/types";
import { DalleGenerator } from "./dalle";
import { FineTunedGenerator } from "./finetuned";
import { IconlyGenerator } from "./iconly";
import { MagnificGenerator } from "./magnific";
import type { ImageGenerator } from "./types";

export function createImageGenerator(provider: ImageProvider = "dalle"): ImageGenerator {
  switch (provider) {
    case "magnific":
      return new MagnificGenerator();
    case "iconly":
      return new IconlyGenerator();
    case "finetuned":
      return new FineTunedGenerator();
    case "dalle":
    default:
      return new DalleGenerator();
  }
}

export type { GeneratedImage, ImageGenerator } from "./types";
