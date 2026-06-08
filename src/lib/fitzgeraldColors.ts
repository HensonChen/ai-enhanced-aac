import type { VocabCategory } from "@/types";

export const FITZGERALD_COLORS: Record<VocabCategory, { border: string; bg: string; text: string; label: string }> = {
  verb: { border: "border-green-500", bg: "bg-green-50", text: "text-green-950", label: "Verb / action" },
  noun: { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-950", label: "Noun / object" },
  descriptor: { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-950", label: "Descriptor" },
  emotion: { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-950", label: "Feeling" },
  social: { border: "border-pink-500", bg: "bg-pink-50", text: "text-pink-950", label: "Social / response" },
};

export const CATEGORY_ORDER: Record<VocabCategory, number> = {
  social: 1,      // Pink
  emotion: 2,     // Yellow
  verb: 3,        // Green
  descriptor: 4,  // Blue
  noun: 5,        // Orange
};

export function getCategoryStyles(category: VocabCategory) {
  return FITZGERALD_COLORS[category] ?? FITZGERALD_COLORS.social;
}

export function sortItemsByCategory<T extends { category: VocabCategory }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const weightA = CATEGORY_ORDER[a.category] ?? 99;
    const weightB = CATEGORY_ORDER[b.category] ?? 99;
    return weightA - weightB;
  });
}
