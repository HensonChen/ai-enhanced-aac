import type { ImageFormat, ImageSource } from "@/types";

export interface GeneratedImage {
  url: string;
  source: ImageSource;
  format: ImageFormat;
  isAnimated: boolean;
}

export interface ImageGenerator {
  name: string;
  generate(word: string, context?: string): Promise<GeneratedImage>;
  supports: {
    svg: boolean;
    animation: boolean;
    batchGenerate: boolean;
  };
}
