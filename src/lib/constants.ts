import type { CaregiverPreferences, ComplexitySettings, VocabularyItem } from "@/types";

export const APP_NAME = "AI AAC Communication Board";

export const DEFAULT_COMPLEXITY: ComplexitySettings = {
  level: "intermediate",
  maxButtons: 10,
  maxWordsPerPhrase: 4,
};

export const COMPLEXITY_LIMITS = {
  maxButtons: { min: 4, max: 32 },
  maxWordsPerPhrase: { min: 2, max: 8 },
};

export const DEFAULT_PREFERENCES: CaregiverPreferences = {
  defaultComplexity: DEFAULT_COMPLEXITY,
  showEmotionalPanel: true,
  emotionalPanelPosition: "bottom",
  layoutMode: "same-screen",
  locale: "en",
  imageProvider: "gpt-image-mini",
};

export const EMOTIONAL_ITEMS: VocabularyItem[] = [
  { id: "emotion-happy", word: "happy", phrase: "I feel happy", category: "emotion", role: "subject", imageUrl: "😊", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-sad", word: "sad", phrase: "I feel sad", category: "emotion", role: "subject", imageUrl: "😢", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-mad", word: "mad", phrase: "I am mad", category: "emotion", role: "subject", imageUrl: "😡", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-scared", word: "scared", phrase: "I feel scared", category: "emotion", role: "subject", imageUrl: "😨", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-tired", word: "tired", phrase: "I am tired", category: "emotion", role: "subject", imageUrl: "🥱", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-hungry", word: "hungry", phrase: "I am hungry", category: "emotion", role: "subject", imageUrl: "😋", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-hug", word: "hug", phrase: "I need a hug", category: "social", role: "subject", imageUrl: "🤗", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-quiet", word: "quiet time", phrase: "I need quiet time", category: "social", role: "subject", imageUrl: "🤫", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
];

export const FALLBACK_EMOJIS: Record<string, string> = {
  grocery: "🛒", store: "🏪", headphones: "🎧", loud: "🔊", quiet: "🤫", home: "🏠", help: "🙋",
  playground: "🛝", play: "🧸", swing: "🎠", turn: "🔄", friend: "🧑‍🤝‍🧑", water: "💧", tired: "🥱",
  bed: "🛏️", bedtime: "🌙", pajamas: "💤", book: "📖", sleep: "😴", bathroom: "🚽", toothbrush: "🪥",
  happy: "😊", sad: "😢", mad: "😡", scared: "😨", hungry: "😋", hug: "🤗", afternoon: "☀️", time: "⏰",
  okay: "👍", stop: "🛑",
};

export const ABSTRACT_ANIMATIONS: Record<string, string> = {
  loud: "/animations/loud.gif",
  quiet: "/animations/quiet.gif",
  tired: "/animations/tired.gif",
  hungry: "/animations/hungry.gif",
  afternoon: "/animations/sun.gif",
  time: "/animations/time.gif",
  overwhelmed: "/animations/storm.gif",
  frustrated: "/animations/mad.gif",
};
