"use client";

import { useEffect, useState } from "react";
import type { BoardRole, ImageProvider, VocabularyItem } from "@/types";
import { getCategoryStyles } from "@/lib/fitzgeraldColors";

interface BoardReviewProps {
  items: VocabularyItem[];
  onItemsChange: (items: VocabularyItem[]) => void;
  onAccept: () => void;
  onSaveBoard: () => void;
  onModifyRequest: (instruction: string, selectedItems: VocabularyItem[]) => void;
  isModifying?: boolean;
  imageProvider?: ImageProvider;
  locale?: string;
}

const COLUMNS: { role: BoardRole; label: string; color: string; bgHeader: string }[] = [
  { role: "subject", label: "Subject", color: "text-pink-700", bgHeader: "bg-pink-50" },
  { role: "verb", label: "Verb", color: "text-green-700", bgHeader: "bg-green-50" },
  { role: "object", label: "Object", color: "text-orange-700", bgHeader: "bg-orange-50" },
];

function isUrl(value: string) {
  return value.startsWith("http") || value.startsWith("data:") || value.startsWith("/");
}

export function BoardReview({
  items,
  onItemsChange,
  onAccept,
  onSaveBoard,
  onModifyRequest,
  isModifying = false,
}: BoardReviewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setSelectedIds(new Set());
  }, [items]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      console.log("selected: ", next);
      return next;
    });
  }

  function removeItem(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function changeRole(id: string, newRole: BoardRole) {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, role: newRole } : item)));
  }

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const selected = items.filter((item) => selectedIds.has(item.id));
    onModifyRequest(chatInput.trim(), selected);
    setChatInput("");
  }

  function filterByRole(role: BoardRole) {
    return items.filter((item) => item.role === role);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 pb-6 shadow-sm" aria-labelledby="review-title">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Review generated vocabulary</p>
          <h2 id="review-title" className="text-2xl font-black text-slate-950">
            Assign roles &amp; customize
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSaveBoard}
            className="rounded-full bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            Save to My Boards
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-full bg-sky-600 px-4 py-2 font-bold text-white transition hover:bg-sky-700"
          >
            Add to Board
          </button>
        </div>
      </div>

      {/* Tip */}
      <p className="mb-3 text-xs text-slate-500">
        Click items to select them as context for the AI chat. Use the dropdown to reassign S/V/O columns.
      </p>

      {/* SVO columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {COLUMNS.map(({ role, label, color, bgHeader }) => (
          <div key={role} className="flex flex-col gap-2">
            <div className={`rounded-xl px-3 py-1.5 text-center ${bgHeader}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wide ${color}`}>{label}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {filterByRole(role).map((item) => {
                const styles = getCategoryStyles(item.category);
                const isSelected = selectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-2xl border-2 p-2.5 transition cursor-pointer ${styles.border} ${styles.bg} ${isSelected ? "ring-2 ring-sky-400 shadow-md" : "shadow-sm"
                      }`}
                    onClick={() => toggleSelect(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelect(item.id); } }}
                    aria-pressed={isSelected}
                    aria-label={`${item.word} - ${isSelected ? "selected" : "not selected"}`}
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-xs font-bold text-red-600 shadow hover:bg-red-50"
                      aria-label={`Remove ${item.word}`}
                    >
                      ✕
                    </button>

                    {/* Image */}
                    <div className="mb-1.5 flex h-12 items-center justify-center overflow-hidden rounded-xl bg-white/80 text-2xl">
                      {isUrl(item.imageUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="h-full max-w-full object-contain p-0.5" />
                      ) : !item.imageUrl.startsWith("[") ? (
                        <span>{item.imageUrl}</span>
                      ) : (
                        <span className="text-sm font-black text-slate-500">
                          {item.imageUrl.replace(/[\[\]]/g, "").slice(0, 6).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Word */}
                    <div className="text-center text-sm font-black leading-tight text-slate-950">{item.word}</div>

                    {/* Role reassignment */}
                    <select
                      value={item.role}
                      onChange={(e) => { e.stopPropagation(); changeRole(item.id, e.target.value as BoardRole); }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                      aria-label={`Role for ${item.word}`}
                    >
                      <option value="subject">Subject</option>
                      <option value="verb">Verb</option>
                      <option value="object">Object</option>
                    </select>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute left-1.5 top-1.5 rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
              {filterByRole(role).length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Input */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-bold text-slate-700">
          Modify with AI
          {selectedIds.size > 0 && (
            <span className="ml-2 text-xs font-medium text-sky-600">
              ({selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected as context)
            </span>
          )}
        </p>
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="e.g. &quot;add more food words&quot; or &quot;regenerate image for playground with a red slide&quot;"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            disabled={isModifying}
          />
          <button
            type="submit"
            disabled={isModifying || !chatInput.trim()}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {isModifying ? "Modifying..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}
