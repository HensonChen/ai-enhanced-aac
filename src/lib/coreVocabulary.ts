import type { VocabularyItem } from "@/types";

function coreItem(
  id: string,
  word: string,
  phrase: string,
  category: VocabularyItem["category"],
  role: VocabularyItem["role"],
  emoji: string,
  isAbstract = false,
): VocabularyItem {
  return {
    id: `core-${role}-${id}`,
    word,
    phrase,
    category,
    role,
    imageUrl: emoji,
    imageSource: "emoji",
    imageFormat: "png",
    isAbstract,
    isAnimated: false,
    type: "word",
  };
}

export const DEFAULT_PERSISTENT_SUBJECTS: VocabularyItem[] = [
  coreItem("i", "I", "I", "social", "subject", "🙋"),
  coreItem("you", "you", "you", "social", "subject", "👉"),
  coreItem("he", "he", "he", "social", "subject", "👦"),
  coreItem("she", "she", "she", "social", "subject", "👧"),
  coreItem("we", "we", "we", "social", "subject", "👫"),
  coreItem("they", "they", "they", "social", "subject", "👥"),
  coreItem("it", "it", "it", "social", "subject", "👆"),
  coreItem("this", "this", "this", "social", "subject", "☝️"),
  coreItem("that", "that", "that", "social", "subject", "👈"),
];

export const DEFAULT_PERSISTENT_VERBS: VocabularyItem[] = [
  coreItem("want", "want", "want", "verb", "verb", "🙏"),
  coreItem("go", "go", "go", "verb", "verb", "🚶"),
  coreItem("help", "help", "help", "verb", "verb", "🆘"),
  coreItem("stop", "stop", "stop", "verb", "verb", "🛑"),
  coreItem("like", "like", "like", "verb", "verb", "👍"),
  coreItem("eat", "eat", "eat", "verb", "verb", "🍽️"),
  coreItem("drink", "drink", "drink", "verb", "verb", "🥤"),
  coreItem("play", "play", "play", "verb", "verb", "🎮"),
  coreItem("see", "see", "see", "verb", "verb", "👀"),
  coreItem("make", "make", "make", "verb", "verb", "🔨"),
  coreItem("get", "get", "get", "verb", "verb", "🤲"),
  coreItem("put", "put", "put", "verb", "verb", "📥"),
  coreItem("give", "give", "give", "verb", "verb", "🎁"),
  coreItem("look", "look", "look", "verb", "verb", "🔍"),
  coreItem("need", "need", "need", "verb", "verb", "❗"),
  coreItem("have", "have", "have", "verb", "verb", "✋"),
  coreItem("is", "is", "is", "verb", "verb", "🟰"),
  coreItem("do", "do", "do", "verb", "verb", "💪"),
  coreItem("come", "come", "come", "verb", "verb", "🫳"),
  coreItem("turn", "turn", "turn", "verb", "verb", "🔄"),
];

export const DEFAULT_PERSISTENT_OBJECTS: VocabularyItem[] = [
  coreItem("more", "more", "more", "descriptor", "object", "➕"),
  coreItem("one", "one", "one", "descriptor", "object", "1️⃣"),
  coreItem("here", "here", "here", "descriptor", "object", "📍"),
  coreItem("there", "there", "there", "descriptor", "object", "👉"),
  coreItem("food", "food", "food", "noun", "object", "🍎"),
  coreItem("water", "water", "water", "noun", "object", "💧"),
  coreItem("home", "home", "home", "noun", "object", "🏠"),
  coreItem("bathroom", "bathroom", "bathroom", "noun", "object", "🚽"),
  coreItem("book", "book", "book", "noun", "object", "📖"),
  coreItem("toy", "toy", "toy", "noun", "object", "🧸"),
  coreItem("outside", "outside", "outside", "noun", "object", "🌳"),
  coreItem("bed", "bed", "bed", "noun", "object", "🛏️"),
  coreItem("car", "car", "car", "noun", "object", "🚗"),
  coreItem("phone", "phone", "phone", "noun", "object", "📱"),
  coreItem("ball", "ball", "ball", "noun", "object", "⚽"),
];

export const DEFAULT_PERSISTENT_VOCAB: VocabularyItem[] = [
  ...DEFAULT_PERSISTENT_SUBJECTS,
  ...DEFAULT_PERSISTENT_VERBS,
  ...DEFAULT_PERSISTENT_OBJECTS,
];
