import type { ComplexitySettings } from "@/types";
import { ComplexityControls } from "./ComplexityControls";
import { VoiceInputButton } from "./VoiceInputButton";

interface CaregiverInputProps {
  context: string;
  complexity: ComplexitySettings;
  loading: boolean;
  onContextChange: (value: string) => void;
  onComplexityChange: (value: ComplexitySettings) => void;
  onGenerate: () => void;
}

export function CaregiverInput({ context, complexity, loading, onContextChange, onComplexityChange, onGenerate }: CaregiverInputProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="setup-title">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-wide text-sky-700">Caregiver setup</p><h2 id="setup-title" className="text-2xl font-black text-slate-950">Describe the situation</h2></div>
        <VoiceInputButton onText={(text) => onContextChange(context ? `${context} ${text}` : text)} />
      </div>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="context-input">Environment and needs</label>
      <textarea id="context-input" value={context} onChange={(event) => onContextChange(event.target.value)} placeholder="Example: We are going to a loud grocery store this afternoon." rows={4} className="mt-2 w-full rounded-3xl border border-slate-300 p-4 text-base text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
      <div className="mt-4"><ComplexityControls value={complexity} onChange={onComplexityChange} /></div>
      <button type="button" onClick={onGenerate} disabled={loading || context.trim().length < 3} className="mt-4 w-full rounded-full bg-slate-950 px-6 py-3 text-lg font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">{loading ? "Generating board..." : "Generate board"}</button>
    </section>
  );
}
