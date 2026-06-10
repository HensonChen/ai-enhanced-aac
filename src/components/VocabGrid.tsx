import type { VocabularyItem } from "@/types";
import { SVOGrid } from "./SVOGrid";

interface VocabGridProps {
  persistentItems: VocabularyItem[];
  contextItems: VocabularyItem[];
  onSelect: (item: VocabularyItem) => void;
  onRemoveContext?: (id: string) => void;
}

export function VocabGrid({ persistentItems, contextItems, onSelect, onRemoveContext }: VocabGridProps) {
  return (
    <SVOGrid
      persistentItems={persistentItems}
      contextItems={contextItems}
      onSelect={onSelect}
      onRemoveContext={onRemoveContext}
      showRemove={!!onRemoveContext}
    />
  );
}
