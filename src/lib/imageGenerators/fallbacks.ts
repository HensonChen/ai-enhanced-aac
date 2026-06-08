import fs from "fs";
import path from "path";
import { ABSTRACT_ANIMATIONS, FALLBACK_EMOJIS } from "../constants";
import type { GeneratedImage } from "./types";

export function emojiFallbackImage(word: string): GeneratedImage {
  const normalized = word.toLowerCase();
  const key = Object.keys(FALLBACK_EMOJIS).find((candidate) => normalized.includes(candidate));
  return {
    url: key ? FALLBACK_EMOJIS[key] : "[message]",
    source: "emoji",
    format: "png",
    isAnimated: false,
  };
}

export function curatedAbstractAnimation(word: string): GeneratedImage | null {
  const normalized = word.toLowerCase();
  const key = Object.keys(ABSTRACT_ANIMATIONS).find((candidate) => normalized.includes(candidate));
  if (!key) return null;

  const relativePath = ABSTRACT_ANIMATIONS[key];
  try {
    const fullPath = path.join(process.cwd(), "public", relativePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
  } catch (error) {
    console.warn("Failed to check file existence for curated animation:", error);
    return null;
  }

  return {
    url: relativePath,
    source: "gif",
    format: "gif",
    isAnimated: true,
  };
}
