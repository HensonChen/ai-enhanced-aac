import type { BoardRole, GeneratedBoard, VocabularyItem } from "@/types";
import { DEFAULT_COMPLEXITY } from "./constants";

const item = (id: string, word: string, phrase: string, category: VocabularyItem["category"], role: BoardRole, emoji: string, isAbstract = false, type: VocabularyItem["type"] = "phrase"): VocabularyItem => ({
  id,
  word,
  phrase,
  category,
  role,
  imageUrl: emoji,
  imageSource: "emoji",
  imageFormat: "png",
  isAbstract,
  isAnimated: false,
  type,
});

export const DEMO_BOARDS: GeneratedBoard[] = [
  {
    id: "demo-grocery",
    context: "Going to a loud grocery store this afternoon",
    timestamp: 1717358400000,
    complexitySettings: DEFAULT_COMPLEXITY,
    isDemo: true,
    items: [
      item("grocery-store", "grocery store", "We are at the grocery store", "noun", "object", "🛒"),
      item("grocery-loud", "loud", "It is loud", "descriptor", "object", "🔊", true, "word"),
      item("grocery-headphones", "headphones", "I need headphones", "noun", "object", "🎧"),
      item("grocery-okay", "okay", "I feel okay", "social", "subject", "👍"),
      item("grocery-too-much", "too much", "It is too much", "emotion", "subject", "⛈️", true),
      item("grocery-go-home", "go home", "I want to go home", "verb", "verb", "🏠"),
      item("grocery-help", "help", "I need help", "social", "subject", "🙋"),
      item("grocery-this-afternoon", "this afternoon", "This afternoon", "descriptor", "object", "☀️", true, "word"),
    ],
  },
  {
    id: "demo-playground",
    context: "Playing at the playground with other children",
    timestamp: 1717358401000,
    complexitySettings: DEFAULT_COMPLEXITY,
    isDemo: true,
    items: [
      item("playground", "playground", "I am at the playground", "noun", "object", "🛝"),
      item("play", "play", "I want to play", "verb", "verb", "🧸", false, "word"),
      item("my-turn", "my turn", "It is my turn", "social", "subject", "🔄"),
      item("friend", "friend", "I want a friend", "noun", "object", "🧑‍🤝‍🧑"),
      item("stop", "stop", "Please stop", "verb", "verb", "🛑"),
      item("water", "water", "I need water", "noun", "object", "💧"),
      item("tired-play", "tired", "I am tired", "emotion", "subject", "🥱", true),
      item("swing", "swing", "I want the swing", "noun", "object", "🎠"),
    ],
  },
  {
    id: "demo-bedtime",
    context: "Getting ready for bed after a long day",
    timestamp: 1717358402000,
    complexitySettings: DEFAULT_COMPLEXITY,
    isDemo: true,
    items: [
      item("bedtime", "bedtime", "It is bedtime", "noun", "object", "🌙", true),
      item("pajamas", "pajamas", "I need pajamas", "noun", "object", "💤"),
      item("brush-teeth", "brush teeth", "I brush my teeth", "verb", "verb", "🪥"),
      item("book", "book", "I want a book", "noun", "object", "📖"),
      item("sleep", "sleep", "I am ready to sleep", "verb", "verb", "😴"),
      item("not-ready", "not ready", "I am not ready", "social", "subject", "🛑"),
      item("bathroom", "bathroom", "I need the bathroom", "noun", "object", "🚽"),
      item("hug-bed", "hug", "I need a hug", "social", "subject", "🤗"),
    ],
  },
];
