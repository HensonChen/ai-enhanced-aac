"use client";

import { useState } from "react";
import type { VocabularyItem } from "@/types";
import { getCategoryStyles } from "@/lib/fitzgeraldColors";

interface VocabButtonProps {
  item: VocabularyItem;
  onSelect: (item: VocabularyItem) => void;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}

const SYMBOL_LABELS: Record<string, string> = {
  cart: "SHOP",
  grocery: "SHOP",
  store: "STORE",
  headphones: "HP",
  loud: "LOUD",
  quiet: "QUIET",
  home: "HOME",
  go: "GO",
  help: "HELP",
  playground: "PLAY",
  play: "PLAY",
  swing: "SWING",
  turn: "TURN",
  friend: "PAL",
  water: "WATER",
  tired: "TIRED",
  moon: "MOON",
  pajamas: "PJ",
  book: "BOOK",
  sleep: "ZZZ",
  bathroom: "WC",
  toothbrush: "TEETH",
  happy: "HAPPY",
  sad: "SAD",
  mad: "MAD",
  scared: "SCARED",
  hungry: "FOOD",
  hug: "HUG",
  sun: "SUN",
  time: "TIME",
  ok: "OK",
  stop: "STOP",
  storm: "TOO MUCH",
  too: "TOO MUCH",
  message: "TALK",
};

function isUrl(value: string) {
  return value.startsWith("http") || value.startsWith("data:") || value.startsWith("/");
}

function displaySymbol(value: string, word: string) {
  const bracket = value.match(/^\[(.+)]$/)?.[1];
  const key = bracket ?? word.toLowerCase().split(/\s+/)[0];
  return SYMBOL_LABELS[key] ?? key.slice(0, 6).toUpperCase();
}

export function VocabButton({ item, onSelect, onRemove, showRemove = false }: VocabButtonProps) {
  const styles = getCategoryStyles(item.category);
  const imageIsUrl = isUrl(item.imageUrl);
  const [imageLoaded, setImageLoaded] = useState(!imageIsUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const fallback = displaySymbol(item.imageUrl, item.word);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`relative min-h-32 overflow-hidden rounded-3xl border-4 ${styles.border} ${styles.bg} ${styles.text} p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-300 active:scale-[0.98]`}
      aria-label={`${item.phrase}. ${styles.label}.`}
    >
      {showRemove && onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${item.word}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(item.id);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onRemove(item.id);
            }
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow"
        >
          X
        </span>
      ) : null}
      <div className="relative mb-2 flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-white/80 text-center">
        {imageIsUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            className="p-1"
            style={{ display: "block", height: "100%", maxHeight: "100%", maxWidth: "100%", objectFit: "contain", width: "auto" }}
          />
        ) : (
          <span className={`${item.isAnimated ? "animate-bounce" : ""} rounded-xl bg-slate-100 px-2 py-1 text-sm font-black tracking-wide text-slate-700`} aria-hidden="true">
            {fallback}
          </span>
        )}
        {imageIsUrl && !imageLoaded && !imageFailed ? (
          <span className="absolute rounded-xl bg-slate-100 px-2 py-1 text-sm font-black tracking-wide text-slate-700" aria-hidden="true">
            {fallback}
          </span>
        ) : null}
      </div>
      <div className="text-center text-lg font-black leading-tight">{item.word}</div>
      <div className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{item.type}</div>
    </button>
  );
}
