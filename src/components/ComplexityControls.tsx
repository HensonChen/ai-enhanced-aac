import type { ComplexitySettings } from "@/types";

const levels: ComplexitySettings["level"][] = ["basic", "intermediate", "advanced"];

interface ComplexityControlsProps {
  value: ComplexitySettings;
  onChange: (value: ComplexitySettings) => void;
}

export function ComplexityControls({ value, onChange }: ComplexityControlsProps) {
  const levelIndex = levels.indexOf(value.level);
  return (
    <fieldset className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <legend className="px-2 text-sm font-bold text-slate-700">Complexity controls</legend>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="complexity-level">Level: <span className="capitalize text-sky-700">{value.level}</span></label>
      <input id="complexity-level" type="range" min={0} max={2} step={1} value={levelIndex} onChange={(event) => onChange({ ...value, level: levels[Number(event.target.value)] })} className="mt-2 w-full accent-sky-600" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Total buttons<input type="number" min={4} max={20} value={value.maxButtons} onChange={(event) => onChange({ ...value, maxButtons: Number(event.target.value) })} className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Max words per phrase<input type="number" min={2} max={8} value={value.maxWordsPerPhrase} onChange={(event) => onChange({ ...value, maxWordsPerPhrase: Number(event.target.value) })} className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2" /></label>
      </div>
    </fieldset>
  );
}
