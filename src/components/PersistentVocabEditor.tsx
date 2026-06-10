"use client";

import { useState } from "react";
import type { BoardRole, VocabularyItem } from "@/types";
import { DEFAULT_PERSISTENT_VOCAB } from "@/lib/coreVocabulary";
import { getCategoryStyles } from "@/lib/fitzgeraldColors";

interface PersistentVocabEditorProps {
  items: VocabularyItem[];
  onSave: (items: VocabularyItem[]) => void;
  onResolveItem: (item: VocabularyItem) => Promise<VocabularyItem>;
  onClose: () => void;
}

const COLUMNS: { role: BoardRole; label: string; color: string }[] = [
  { role: "subject", label: "Subject", color: "text-pink-700" },
  { role: "verb", label: "Verb", color: "text-green-700" },
  { role: "object", label: "Object", color: "text-orange-700" },
];

export function PersistentVocabEditor({ items, onSave, onResolveItem, onClose }: PersistentVocabEditorProps) {
  const [editedItems, setEditedItems] = useState<VocabularyItem[]>(items);
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(() => new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newRole, setNewRole] = useState<BoardRole>("object");

  function removeItem(id: string) {
    setEditedItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newWord.trim()) return;

    const word = newWord.trim();
    const category: VocabularyItem["category"] = newRole === "verb" ? "verb" : newRole === "subject" ? "social" : "noun";

    const newItem: VocabularyItem = {
      id: `core-custom-${crypto.randomUUID()}`,
      word,
      phrase: word,
      category,
      role: newRole,
      imageUrl: "[loading]",
      imageSource: "emoji",
      imageFormat: "png",
      isAbstract: false,
      isAnimated: false,
      type: "word",
    };

    setEditedItems((prev) => [...prev, newItem]);
    setResolvingIds((prev) => new Set(prev).add(newItem.id));
    setNewWord("");
    setShowAddForm(false);

    onResolveItem(newItem)
      .then((resolvedItem) => {
        const itemWithFallback = resolvedItem.imageUrl === "[loading]" ? { ...resolvedItem, imageUrl: `[${word}]` } : resolvedItem;
        setEditedItems((prev) => prev.map((item) => (item.id === newItem.id ? itemWithFallback : item)));
      })
      .catch(() => {
        setEditedItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, imageUrl: `[${word}]` } : item)));
      })
      .finally(() => {
        setResolvingIds((prev) => {
          const next = new Set(prev);
          next.delete(newItem.id);
          return next;
        });
      });
  }

  function resetToDefaults() {
    if (window.confirm("Reset persistent vocabulary to defaults? This will remove any customizations.")) {
      setEditedItems(DEFAULT_PERSISTENT_VOCAB);
    }
  }

  function handleSave() {
    if (resolvingIds.size > 0) return;
    onSave(editedItems);
    onClose();
  }

  function filterByRole(role: BoardRole) {
    return editedItems.filter((item) => item.role === role);
  }

  const isResolvingImages = resolvingIds.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Customize Persistent Vocabulary</h2>
            <p className="text-sm text-slate-500">These words are always visible on the board.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* SVO columns */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {COLUMNS.map(({ role, label, color }) => (
            <div key={role}>
              <h3 className={`mb-2 text-center text-sm font-bold uppercase tracking-wide ${color}`}>{label}</h3>
              <div className="flex flex-wrap gap-1.5">
                {filterByRole(role).map((item) => {
                  const styles = getCategoryStyles(item.category);
                  return (
                    <span key={item.id} className={`inline-flex items-center gap-1 rounded-full border ${styles.border} ${styles.bg} px-2.5 py-1 text-xs font-bold`}>
                      <span>{item.imageUrl.startsWith("[") || item.imageUrl.startsWith("http") ? "" : item.imageUrl}</span>
                      <span>{item.word}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-0.5 text-red-500 hover:text-red-700"
                        aria-label={`Remove ${item.word}`}
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAddForm ? (
          <form onSubmit={addItem} className="mb-4 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="New word..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              autoFocus
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as BoardRole)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="subject">Subject</option>
              <option value="verb">Verb</option>
              <option value="object">Object</option>
            </select>
            <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white">
              Add
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600">
              Cancel
            </button>
          </form>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-300"
            >
              + Add word
            </button>
          )}
          <button
            type="button"
            onClick={resetToDefaults}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600 ring-1 ring-red-200"
          >
            Reset to defaults
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleSave}
            disabled={isResolvingImages}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isResolvingImages ? "Resolving images..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
