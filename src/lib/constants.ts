import type { CaregiverPreferences, ComplexitySettings, VocabularyItem } from "@/types";

export const APP_NAME = "AI AAC Board";

export const DEFAULT_COMPLEXITY: ComplexitySettings = {
  level: "intermediate",
  maxButtons: 10,
  maxWordsPerPhrase: 4,
};

export const DEFAULT_PREFERENCES: CaregiverPreferences = {
  defaultComplexity: DEFAULT_COMPLEXITY,
  showEmotionalPanel: true,
  emotionalPanelPosition: "bottom",
  layoutMode: "same-screen",
  locale: "en",
  imageProvider: "dalle",
};

export const EMOTIONAL_ITEMS: VocabularyItem[] = [
  { id: "emotion-happy", word: "happy", phrase: "I feel happy", category: "emotion", imageUrl: "happy", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-sad", word: "sad", phrase: "I feel sad", category: "emotion", imageUrl: "sad", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-mad", word: "mad", phrase: "I am mad", category: "emotion", imageUrl: "mad", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-scared", word: "scared", phrase: "I feel scared", category: "emotion", imageUrl: "scared", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-tired", word: "tired", phrase: "I am tired", category: "emotion", imageUrl: "tired", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-hungry", word: "hungry", phrase: "I am hungry", category: "emotion", imageUrl: "hungry", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-hug", word: "hug", phrase: "I need a hug", category: "social", imageUrl: "hug", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
  { id: "emotion-quiet", word: "quiet time", phrase: "I need quiet time", category: "social", imageUrl: "quiet", imageSource: "emoji", imageFormat: "png", isAbstract: true, isAnimated: false, type: "phrase" },
];

export const FALLBACK_EMOJIS: Record<string, string> = {
  grocery: "[cart]", store: "[store]", headphones: "[headphones]", loud: "[loud]", quiet: "[quiet]", home: "[home]", help: "[help]",
  playground: "[playground]", play: "[play]", swing: "[swing]", turn: "[turn]", friend: "[friend]", water: "[water]", tired: "[tired]",
  bed: "[bed]", bedtime: "[moon]", pajamas: "[pajamas]", book: "[book]", sleep: "[sleep]", bathroom: "[bathroom]", toothbrush: "[toothbrush]",
  happy: "[happy]", sad: "[sad]", mad: "[mad]", scared: "[scared]", hungry: "[hungry]", hug: "[hug]", afternoon: "[sun]", time: "[time]",
  okay: "[ok]", stop: "[stop]",
};

export const ABSTRACT_ANIMATIONS: Record<string, string> = {
  loud: "[loud]", quiet: "[quiet]", tired: "[tired]", hungry: "[hungry]", afternoon: "[sun]", time: "[time]", overwhelmed: "[storm]", frustrated: "[mad]",
};
