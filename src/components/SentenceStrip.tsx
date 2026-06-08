import type { SentenceToken } from "@/types";

interface SentenceStripProps {
  tokens: SentenceToken[];
  onSpeak: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onRemove: (id: string) => void;
}

export function SentenceStrip({ tokens, onSpeak, onClear, onBackspace, onRemove }: SentenceStripProps) {
  return (
    <section className="sticky top-0 z-20 rounded-b-3xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur" aria-label="Sentence builder">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {tokens.length === 0 ? <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-500">Tap buttons to build a sentence</span> : tokens.map((token) => (
          <button key={token.id} type="button" onClick={() => onRemove(token.id)} className="rounded-full bg-sky-100 px-4 py-2 text-base font-bold text-sky-950 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400" aria-label={`Remove ${token.word}`}>{token.word}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSpeak} disabled={tokens.length === 0} className="rounded-full bg-slate-900 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Speak</button>
        <button type="button" onClick={onBackspace} disabled={tokens.length === 0} className="rounded-full bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:text-slate-300">Backspace</button>
        <button type="button" onClick={onClear} disabled={tokens.length === 0} className="rounded-full bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:text-slate-300">Clear</button>
      </div>
    </section>
  );
}
