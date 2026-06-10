import type { CaregiverPreferences, ImageProvider, VocabularyItem } from "@/types";
import { DEFAULT_PREFERENCES } from "./constants";

export {
  dbLoadPersistentVocab,
  dbSavePersistentVocab,
  dbLoadContextVocab,
  dbSaveContextVocab,
  dbLoadGenerationHistory,
  dbSaveToHistory,
  dbLoadSavedBoards,
  dbSaveBoard,
  dbRemoveSavedBoard,
  dbGetImage,
  dbPutImage,
} from "./db";

const PREFERENCES_KEY = "aac-caregiver-preferences";
const ONBOARDING_KEY = "aac-onboarding-seen";

const isBrowser = () => typeof window !== "undefined";

export function loadPreferences(): CaregiverPreferences {
  if (!isBrowser()) return DEFAULT_PREFERENCES;
  const raw = window.localStorage.getItem(PREFERENCES_KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: CaregiverPreferences) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.error("Failed to save caregiver preferences:", e);
  }
}

export function hasSeenOnboarding() {
  return isBrowser() && window.localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingSeen() {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ONBOARDING_KEY, "true");
  } catch (e) {
    console.error("Failed to save onboarding state:", e);
  }
}

export function imageCacheKey(word: string, provider: ImageProvider) {
  return `${provider}:${word.toLowerCase().trim()}`;
}

type CachedImage = Pick<VocabularyItem, "imageUrl" | "imageSource" | "imageFormat" | "isAnimated">;

export function getCachedImage(word: string, provider: ImageProvider): CachedImage | null {
  if (!isBrowser()) return null;
  try {
    const cache = JSON.parse(window.localStorage.getItem("aac-image-cache") ?? "{}") as Record<string, CachedImage>;
    return cache[imageCacheKey(word, provider)] ?? null;
  } catch {
    return null;
  }
}

export function setCachedImage(word: string, provider: ImageProvider, image: CachedImage) {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem("aac-image-cache") ?? "{}";
    const cache = JSON.parse(raw) as Record<string, CachedImage>;
    cache[imageCacheKey(word, provider)] = image;
    try {
      window.localStorage.setItem("aac-image-cache", JSON.stringify(cache));
    } catch {
      window.localStorage.removeItem("aac-image-cache");
    }
  } catch (e) {
    console.error("Failed to cache image:", e);
  }
}
