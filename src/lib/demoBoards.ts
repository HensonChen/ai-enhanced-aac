import type { GeneratedBoard, VocabularyItem } from "@/types";
import { DEFAULT_COMPLEXITY } from "./constants";

const item = (id: string, word: string, phrase: string, category: VocabularyItem["category"], emoji: string, isAbstract = false, type: VocabularyItem["type"] = "phrase"): VocabularyItem => ({
  id,
  word,
  phrase,
  category,
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
      item("grocery-store", "grocery store", "We are at the grocery store", "noun", "[cart]"),
      item("grocery-loud", "loud", "It is loud", "descriptor", "[loud]", true, "word"),
      item("grocery-headphones", "headphones", "I need headphones", "noun", "[headphones]"),
      item("grocery-okay", "okay", "I feel okay", "social", "[ok]"),
      item("grocery-too-much", "too much", "It is too much", "emotion", "[storm]", true),
      item("grocery-go-home", "go home", "I want to go home", "verb", "[home]"),
      item("grocery-help", "help", "I need help", "social", "[help]"),
      item("grocery-this-afternoon", "this afternoon", "This afternoon", "descriptor", "[sun]", true, "word"),
    ],
  },
  {
    id: "demo-playground",
    context: "Playing at the playground with other children",
    timestamp: 1717358401000,
    complexitySettings: DEFAULT_COMPLEXITY,
    isDemo: true,
    items: [
      item("playground", "playground", "I am at the playground", "noun", "[playground]"),
      item("play", "play", "I want to play", "verb", "[play]", false, "word"),
      item("my-turn", "my turn", "It is my turn", "social", "[turn]"),
      item("friend", "friend", "I want a friend", "noun", "[friend]"),
      item("stop", "stop", "Please stop", "verb", "[stop]"),
      item("water", "water", "I need water", "noun", "[water]"),
      item("tired-play", "tired", "I am tired", "emotion", "[tired]", true),
      item("swing", "swing", "I want the swing", "noun", "[swing]"),
    ],
  },
  {
    id: "demo-bedtime",
    context: "Getting ready for bed after a long day",
    timestamp: 1717358402000,
    complexitySettings: DEFAULT_COMPLEXITY,
    isDemo: true,
    items: [
      item("bedtime", "bedtime", "It is bedtime", "noun", "[moon]", true),
      item("pajamas", "pajamas", "I need pajamas", "noun", "[pajamas]"),
      item("brush-teeth", "brush teeth", "I brush my teeth", "verb", "[toothbrush]"),
      item("book", "book", "I want a book", "noun", "[book]"),
      item("sleep", "sleep", "I am ready to sleep", "verb", "[sleep]"),
      item("not-ready", "not ready", "I am not ready", "social", "[stop]"),
      item("bathroom", "bathroom", "I need the bathroom", "noun", "[bathroom]"),
      item("hug-bed", "hug", "I need a hug", "social", "[hug]"),
    ],
  },
];
