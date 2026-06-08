import type { GeneratedBoard } from "@/types";

interface BoardHistoryProps { boards: GeneratedBoard[]; onSelect: (board: GeneratedBoard) => void; }

export function BoardHistory({ boards, onSelect }: BoardHistoryProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="history-title">
      <h2 id="history-title" className="text-xl font-black text-slate-950">Recent boards</h2>
      {boards.length === 0 ? <p className="mt-2 text-sm text-slate-500">Generated boards will appear here.</p> : (
        <div className="mt-4 grid gap-2">
          {boards.map((board) => <button key={board.id} type="button" onClick={() => onSelect(board)} className="rounded-2xl bg-slate-100 px-4 py-3 text-left hover:bg-sky-100"><span className="block font-bold text-slate-800">{board.context}</span><span className="text-xs text-slate-500">{new Date(board.timestamp).toLocaleString()}</span></button>)}
        </div>
      )}
    </section>
  );
}
