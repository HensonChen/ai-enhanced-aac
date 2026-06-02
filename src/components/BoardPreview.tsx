import type { VocabularyItem } from "@/types";
import { VocabButton } from "./VocabButton";

interface BoardPreviewProps { items: VocabularyItem[]; onItemsChange: (items: VocabularyItem[]) => void; onUseBoard: () => void; }

export function BoardPreview({ items, onItemsChange, onUseBoard }: BoardPreviewProps) {
  const addCustomItem = () => {
    const word = window.prompt("Custom word or phrase");
    if (!word) return;
    onItemsChange([...items, { id: `custom-${crypto.randomUUID()}`, word, phrase: word, category: "social", imageUrl: "[message]", imageSource: "emoji", imageFormat: "png", isAbstract: false, isAnimated: false, type: word.trim().split(/\s+/).length > 1 ? "phrase" : "word" }]);
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 pb-8 shadow-sm" aria-labelledby="preview-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold uppercase tracking-wide text-sky-700">Optional review</p><h2 id="preview-title" className="text-2xl font-black text-slate-950">Review generated vocabulary</h2></div>
        <div className="flex gap-2"><button type="button" onClick={addCustomItem} className="rounded-full bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-300">Add custom</button><button type="button" onClick={onUseBoard} className="rounded-full bg-sky-600 px-4 py-2 font-bold text-white">Use this board</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => <VocabButton key={item.id} item={item} onSelect={() => {}} showRemove onRemove={(id) => onItemsChange(items.filter((candidate) => candidate.id !== id))} />)}
      </div>
    </section>
  );
}
