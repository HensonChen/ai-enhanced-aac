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
  if (isBrowser()) window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
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
  const withoutDuplicate = loadBoardHistory().filter((item) => item.id !== board.id);
  window.localStorage.setItem(BOARD_HISTORY_KEY, JSON.stringify([board, ...withoutDuplicate].slice(0, 10)));
}

export function hasSeenOnboarding() {
  return isBrowser() && window.localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingSeen() {
  if (isBrowser()) window.localStorage.setItem(ONBOARDING_KEY, "true");
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
  const raw = window.localStorage.getItem(IMAGE_CACHE_KEY) ?? "{}";
  const cache = JSON.parse(raw) as Record<string, CachedImage>;
  cache[imageCacheKey(word, provider)] = image;
  window.localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
}
