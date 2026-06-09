"use client";

import type { GeneratedBoard } from "@/types";

interface GenerationHistoryProps {
  boards: GeneratedBoard[];
  onSelect: (board: GeneratedBoard) => void;
}

export function GenerationHistory({ boards, onSelect }: GenerationHistoryProps) {
  if (boards.length === 0) return null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500">Generation History</h3>
      <p className="mb-2 text-xs text-slate-500">Open a generated board for review and editing.</p>
      <ul className="space-y-1.5 max-h-40 overflow-y-auto">
        {boards.map((board) => (
          <li key={board.id}>
            <button
              type="button"
              onClick={() => onSelect(board)}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <span className="block truncate font-semibold">{board.context}</span>
              <span className="text-xs text-slate-400">
                {new Date(board.timestamp).toLocaleDateString()} · {board.items.length} items
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
