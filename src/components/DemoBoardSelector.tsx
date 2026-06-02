import type { GeneratedBoard } from "@/types";
import { DEMO_BOARDS } from "@/lib/demoBoards";

interface DemoBoardSelectorProps { onSelect: (board: GeneratedBoard) => void; }

export function DemoBoardSelector({ onSelect }: DemoBoardSelectorProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="demo-title">
      <h2 id="demo-title" className="text-xl font-black text-slate-950">Demo boards</h2>
      <p className="mt-1 text-sm text-slate-600">Try the prototype without an API key.</p>
      <div className="mt-4 grid gap-2">
        {DEMO_BOARDS.map((board) => <button key={board.id} type="button" onClick={() => onSelect(board)} className="rounded-2xl bg-slate-100 px-4 py-3 text-left font-bold text-slate-800 hover:bg-sky-100">{board.context}</button>)}
      </div>
    </section>
  );
}
