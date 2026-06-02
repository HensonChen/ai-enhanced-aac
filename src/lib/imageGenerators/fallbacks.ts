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
  return {
    url: ABSTRACT_ANIMATIONS[key],
    source: "gif",
    format: "gif",
    isAnimated: true,
  };
}
