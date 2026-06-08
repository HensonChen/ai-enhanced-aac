import type { CaregiverPreferences, GeneratedBoard, ImageProvider, VocabularyItem } from "@/types";
import { DEFAULT_PREFERENCES } from "./constants";

const BOARD_HISTORY_KEY = "aac-board-history";
const PREFERENCES_KEY = "aac-caregiver-preferences";
const IMAGE_CACHE_KEY = "aac-image-cache";
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

export function loadBoardHistory(): GeneratedBoard[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(BOARD_HISTORY_KEY) ?? "[]") as GeneratedBoard[];
  } catch {
    return [];
  }
}

export function saveBoardToHistory(board: GeneratedBoard) {
  if (!isBrowser() || board.isDemo) return;
  try {
    const withoutDuplicate = loadBoardHistory().filter((item) => item.id !== board.id);
    const history = [board, ...withoutDuplicate];
    
    // Try to save up to 10 items. If quota is exceeded, degrade by saving fewer items.
    for (let limit = 10; limit > 0; limit--) {
      try {
        const sliced = history.slice(0, limit);
        window.localStorage.setItem(BOARD_HISTORY_KEY, JSON.stringify(sliced));
        break; // Successfully saved
      } catch (setItemError) {
        if (limit === 1) {
          console.warn("Storage quota exceeded. Could not save even a single board to history.", setItemError);
        }
      }
    }
  } catch (e) {
    console.error("Failed to save board to history:", e);
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
    const cache = JSON.parse(window.localStorage.getItem(IMAGE_CACHE_KEY) ?? "{}") as Record<string, CachedImage>;
    return cache[imageCacheKey(word, provider)] ?? null;
  } catch {
    return null;
  }
}

export function setCachedImage(word: string, provider: ImageProvider, image: CachedImage) {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(IMAGE_CACHE_KEY) ?? "{}";
    const cache = JSON.parse(raw) as Record<string, CachedImage>;
    cache[imageCacheKey(word, provider)] = image;
    
    try {
      window.localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    } catch (quotaError) {
      console.warn("Image cache storage quota exceeded. Pruning old cache entries...", quotaError);
      
      // Prune: Keep only the second half of entries to make space
      const keys = Object.keys(cache);
      const prunedCache: Record<string, CachedImage> = {};
      keys.slice(Math.floor(keys.length / 2)).forEach((key) => {
        prunedCache[key] = cache[key];
      });

      try {
        window.localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(prunedCache));
      } catch (retryError) {
        // If still failing, clear the entire image cache
        console.warn("Pruning failed. Clearing image cache completely.", retryError);
        window.localStorage.removeItem(IMAGE_CACHE_KEY);
      }
    }
  } catch (e) {
    console.error("Failed to cache image:", e);
  }
}
