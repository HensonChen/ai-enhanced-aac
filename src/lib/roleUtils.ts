import type { BoardRole, VocabCategory } from "@/types";

const SUBJECT_WORDS = new Set([
  "i", "you", "he", "she", "we", "they", "it", "this", "that",
  "who", "someone", "everybody", "nobody", "friend", "mom", "dad",
  "teacher", "brother", "sister", "baby", "person", "people",
]);

export function inferRoleFromCategory(category: VocabCategory, word?: string): BoardRole {
  if (word && SUBJECT_WORDS.has(word.toLowerCase())) return "subject";
  switch (category) {
    case "verb":
      return "verb";
    case "noun":
    case "descriptor":
      return "object";
    case "emotion":
    case "social":
      return "subject";
  }
}
