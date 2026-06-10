import { useEffect, useState } from "react";
import type { ImageProvider, VocabularyItem } from "@/types";
import { getCategoryStyles, sortItemsByCategory } from "@/lib/fitzgeraldColors";
import { setCachedImage } from "@/lib/storage";

interface BoardPreviewProps {
  items: VocabularyItem[];
  onItemsChange: (items: VocabularyItem[] | ((prev: VocabularyItem[]) => VocabularyItem[])) => void;
  onUseBoard: () => void;
  imageProvider?: ImageProvider;
  locale?: string;
}

function isUrl(value: string) {
  return value.startsWith("http") || value.startsWith("data:") || value.startsWith("/");
}

function previewSymbol(item: VocabularyItem) {
  if (item.imageUrl.startsWith("[")) return item.imageUrl.replace(/[\[\]]/g, "").slice(0, 8).toUpperCase();
  return item.word.slice(0, 8).toUpperCase();
}

function LoadingDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "." : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block min-w-[1.25rem] text-left">{dots}</span>;
}

export function BoardPreview({ items, onItemsChange, onUseBoard, imageProvider, locale }: BoardPreviewProps) {
  const addCustomItem = () => {
    const word = window.prompt("Custom word or phrase");
    if (!word) return;

    const id = `custom-${crypto.randomUUID()}`;
    const isPhrase = word.trim().split(/\s+/).length > 1;
    const newItem: VocabularyItem = {
      id,
      word,
      phrase: word,
      category: "social",
      role: "object",
      imageUrl: "[loading]",
      imageSource: "emoji",
      imageFormat: "png",
      isAbstract: false,
      isAnimated: false,
      type: isPhrase ? "phrase" : "word",
    };

    onItemsChange((current) => {
      // If functional update is supported by dispatcher (which React's state setter is):
      if (Array.isArray(current)) {
        return [...current, newItem];
      }
      return [...items, newItem];
    });

    const activeProvider = imageProvider ?? "gpt-image-mini";

    fetch("/api/resolve-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word,
        isAbstract: false,
        context: "AAC communication board",
        locale: locale ?? "en",
        provider: activeProvider,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not resolve custom image");
        return res.json();
      })
      .then((image) => {
        if (!image?.url) return;
        const merged = { imageUrl: image.url, imageSource: image.source, imageFormat: image.format, isAnimated: image.isAnimated };
        setCachedImage(word, activeProvider, merged);
        onItemsChange((current) => {
          const list = Array.isArray(current) ? current : items;
          return list.map((item) =>
            item.id === id ? { ...item, ...merged } : item
          );
        });
      })
      .catch((err) => {
        console.error("Failed to resolve image for custom item:", err);
      });
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 pb-8 shadow-sm" aria-labelledby="preview-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-sky-700">Optional review</p><h2 id="preview-title" className="text-2xl font-black text-slate-950">Review generated vocabulary</h2></div>
        <div className="flex gap-2"><button type="button" onClick={addCustomItem} className="rounded-full bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-300">Add custom</button><button type="button" onClick={onUseBoard} className="rounded-full bg-sky-600 px-4 py-2 font-bold text-white">Use this board</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sortItemsByCategory(items).map((item) => {
          const styles = getCategoryStyles(item.category);
          return (
            <div key={item.id} className={`relative min-h-32 rounded-3xl border-4 ${styles.border} ${styles.bg} p-3 text-center shadow-sm`}>
              <button type="button" onClick={() => onItemsChange(items.filter((candidate) => candidate.id !== item.id))} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow" aria-label={`Remove ${item.word}`}>Remove</button>
              <div className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-white/80 text-4xl">
                {isUrl(item.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full max-w-full object-contain p-1 text-base" />
                ) : item.imageUrl === "[loading]" ? (
                  <span className="rounded-xl bg-slate-100 px-2 py-1 text-sm font-black tracking-wide text-slate-700 text-base flex items-center gap-0.5">
                    Loading<LoadingDots />
                  </span>
                ) : !item.imageUrl.startsWith("[") ? (
                  <span>{item.imageUrl}</span>
                ) : (
                  <span className="rounded-xl bg-slate-100 px-2 py-1 text-sm font-black tracking-wide text-slate-700 text-base">
                    {previewSymbol(item)}
                  </span>
                )}
              </div>
              <div className="text-lg font-black leading-tight text-slate-950">{item.word}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.type}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
