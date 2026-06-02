import type { VocabularyItem } from "@/types";
import { getCategoryStyles } from "@/lib/fitzgeraldColors";

interface VocabButtonProps {
  item: VocabularyItem;
  onSelect: (item: VocabularyItem) => void;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}

function isUrl(value: string) {
  return value.startsWith("http") || value.startsWith("data:") || value.startsWith("/");
}

export function VocabButton({ item, onSelect, onRemove, showRemove = false }: VocabButtonProps) {
  const styles = getCategoryStyles(item.category);
  const imageIsUrl = isUrl(item.imageUrl);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`relative min-h-32 rounded-3xl border-4 ${styles.border} ${styles.bg} ${styles.text} p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-300 active:scale-[0.98]`}
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
      <div className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-white/75 text-3xl font-black">
        {imageIsUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className={item.isAnimated ? "animate-bounce" : ""} aria-hidden="true">{item.imageUrl}</span>
        )}
      </div>
      <div className="text-center text-lg font-black leading-tight">{item.word}</div>
      <div className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{item.type}</div>
    </button>
  );
}
