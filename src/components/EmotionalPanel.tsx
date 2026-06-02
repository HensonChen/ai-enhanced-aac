import type { VocabularyItem } from "@/types";
import { EMOTIONAL_ITEMS } from "@/lib/constants";
import { VocabButton } from "./VocabButton";

interface EmotionalPanelProps { open: boolean; onToggle: () => void; onSelect: (item: VocabularyItem) => void; }

export function EmotionalPanel({ open, onToggle, onSelect }: EmotionalPanelProps) {
  return (
    <section className="rounded-[2rem] border border-yellow-200 bg-yellow-50/80 p-4 shadow-sm" aria-labelledby="feelings-title">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span><span className="block text-sm font-bold uppercase tracking-wide text-yellow-700">Feelings panel</span><span id="feelings-title" className="text-xl font-black text-slate-950">Immediate emotional expressions</span></span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">{open ? "Collapse" : "Expand"}</span>
      </button>
      {open ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{EMOTIONAL_ITEMS.map((item) => <VocabButton key={item.id} item={item} onSelect={onSelect} />)}</div> : null}
    </section>
  );
}
