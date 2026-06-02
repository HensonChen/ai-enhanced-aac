import type { VocabularyItem } from "@/types";
import { VocabButton } from "./VocabButton";

interface VocabGridProps {
  items: VocabularyItem[];
  onSelect: (item: VocabularyItem) => void;
}

export function VocabGrid({ items, onSelect }: VocabGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
        Generate or load a board to see vocabulary buttons.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" role="list" aria-label="Vocabulary board">
      {items.map((item) => <VocabButton key={item.id} item={item} onSelect={onSelect} />)}
    </div>
  );
}
