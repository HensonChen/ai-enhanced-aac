"use client";

import type { BoardRole, VocabularyItem } from "@/types";
import { VocabButton } from "./VocabButton";

interface SVOGridProps {
  persistentItems: VocabularyItem[];
  contextItems: VocabularyItem[];
  onSelect: (item: VocabularyItem) => void;
  onRemovePersistent?: (id: string) => void;
  onRemoveContext?: (id: string) => void;
  showRemove?: boolean;
}

const COLUMN_CONFIG: { role: BoardRole; label: string; color: string }[] = [
  { role: "subject", label: "Subject", color: "text-pink-600" },
  { role: "verb", label: "Verb", color: "text-green-600" },
  { role: "object", label: "Object", color: "text-orange-600" },
];

function filterByRole(items: VocabularyItem[], role: BoardRole) {
  return items.filter((item) => item.role === role);
}

export function SVOGrid({
  persistentItems,
  contextItems,
  onSelect,
  onRemovePersistent,
  onRemoveContext,
  showRemove = false,
}: SVOGridProps) {
  const hasContext = contextItems.length > 0;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm" role="grid" aria-label="Communication board">
      <div className="grid grid-cols-3 gap-3">
        {COLUMN_CONFIG.map(({ role, label, color }) => (
          <div key={role} className="flex flex-col gap-2">
            <h3 className={`text-center text-sm font-bold uppercase tracking-wide ${color}`}>
              {label}
            </h3>

            {/* Persistent section */}
            <div className="space-y-2">
              {filterByRole(persistentItems, role).map((item) => (
                <VocabButton
                  key={item.id}
                  item={item}
                  onSelect={onSelect}
                  onRemove={onRemovePersistent}
                  showRemove={showRemove}
                />
              ))}
            </div>

            {/* Divider between persistent and context */}
            {hasContext && (
              <div className="my-1 border-t border-dashed border-slate-200" />
            )}

            {/* Context-based section */}
            {hasContext && (
              <div className="space-y-2">
                {filterByRole(contextItems, role).map((item) => (
                  <VocabButton
                    key={item.id}
                    item={item}
                    onSelect={onSelect}
                    onRemove={onRemoveContext}
                    showRemove={showRemove}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {persistentItems.length === 0 && contextItems.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
          Generate or load a board to see vocabulary buttons.
        </div>
      )}
    </div>
  );
}
