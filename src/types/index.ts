export type VocabCategory = "verb" | "noun" | "descriptor" | "emotion" | "social";
export type BoardRole = "subject" | "verb" | "object";
export type ImageSource = "arasaac" | "gpt-image-mini" | "magnific" | "iconly" | "finetuned" | "gif" | "emoji";
export type ImageFormat = "png" | "svg" | "gif" | "webp";
export type ComplexityLevel = "basic" | "intermediate" | "advanced";
export type LayoutMode = "same-screen" | "two-view" | "split";
export type EmotionalPanelPosition = "bottom" | "side";
export type ImageProvider = "gpt-image-mini" | "magnific" | "iconly" | "finetuned";

export interface VocabularyItem {
  id: string;
  word: string;
  phrase: string;
  category: VocabCategory;
  role: BoardRole;
  imageUrl: string;
  imageSource: ImageSource;
  imageFormat: ImageFormat;
  isAbstract: boolean;
  isAnimated: boolean;
  type: "word" | "phrase";
}

export interface ComplexitySettings {
  level: ComplexityLevel;
  maxButtons: number;
  maxWordsPerPhrase: number;
}

export interface GeneratedBoard {
  id: string;
  context: string;
  timestamp: number;
  items: VocabularyItem[];
  complexitySettings: ComplexitySettings;
  isDemo: boolean;
}

export interface CaregiverPreferences {
  defaultComplexity: ComplexitySettings;
  showEmotionalPanel: boolean;
  emotionalPanelPosition: EmotionalPanelPosition;
  layoutMode: LayoutMode;
  locale: string;
  imageProvider: ImageProvider;
}

export interface SentenceToken {
  id: string;
  word: string;
  phrase: string;
  category: VocabCategory;
}
