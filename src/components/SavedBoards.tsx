"use client";

import type { GeneratedBoard } from "@/types";

interface SavedBoardsProps {
  boards: GeneratedBoard[];
  onSelect: (board: GeneratedBoard) => void;
  onRemove: (id: string) => void;
}

export function SavedBoards({ boards, onSelect, onRemove }: SavedBoardsProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-sky-700">My Saved Customized Boards</h3>
      <p className="mb-2 text-xs text-slate-500">Saved context boards ready to load.</p>
      {boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-400">
          No saved boards yet.
        </div>
      ) : (
      <ul className="space-y-1.5 max-h-40 overflow-y-auto">
        {boards.map((board) => (
          <li key={board.id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(board)}
              className="flex-1 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <span className="block truncate font-semibold">{board.context}</span>
              <span className="text-xs text-slate-400">
                {new Date(board.timestamp).toLocaleDateString()} · {board.items.length} items
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(board.id)}
              className="shrink-0 rounded-full p-1.5 text-slate-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
              aria-label={`Remove ${board.context}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
