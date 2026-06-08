import type { ComplexitySettings } from "@/types";
import { COMPLEXITY_LIMITS } from "@/lib/constants";

const levels: ComplexitySettings["level"][] = ["basic", "intermediate", "advanced"];

interface ComplexityControlsProps {
  value: ComplexitySettings;
  onChange: (value: ComplexitySettings) => void;
}

export function ComplexityControls({ value, onChange }: ComplexityControlsProps) {
  const levelIndex = levels.indexOf(value.level);

  const buttonsError = value.maxButtons < COMPLEXITY_LIMITS.maxButtons.min || value.maxButtons > COMPLEXITY_LIMITS.maxButtons.max;
  const wordsError = value.maxWordsPerPhrase < COMPLEXITY_LIMITS.maxWordsPerPhrase.min || value.maxWordsPerPhrase > COMPLEXITY_LIMITS.maxWordsPerPhrase.max;

  return (
    <fieldset className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <legend className="px-2 text-sm font-bold text-slate-700">Complexity controls</legend>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="complexity-level">Level: <span className="capitalize text-sky-700">{value.level}</span></label>
      <input id="complexity-level" type="range" min={0} max={2} step={1} value={levelIndex} onChange={(event) => onChange({ ...value, level: levels[Number(event.target.value)] })} className="mt-2 w-full accent-sky-600" />

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 block">Total buttons
            <input
              type="number"
              min={COMPLEXITY_LIMITS.maxButtons.min}
              max={COMPLEXITY_LIMITS.maxButtons.max}
              value={value.maxButtons}
              onChange={(event) => onChange({ ...value, maxButtons: Number(event.target.value) })}
              className={`mt-1 w-full rounded-2xl border ${buttonsError ? "border-red-500 ring-1 ring-red-100" : "border-slate-300"} px-3 py-2 outline-none focus:border-sky-500`}
            />
          </label>
          {buttonsError && (
            <p className="mt-1 text-[11px] font-semibold text-red-500 leading-tight">
              Must be between {COMPLEXITY_LIMITS.maxButtons.min} and {COMPLEXITY_LIMITS.maxButtons.max}.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block">Max words per phrase
            <input
              type="number"
              min={COMPLEXITY_LIMITS.maxWordsPerPhrase.min}
              max={COMPLEXITY_LIMITS.maxWordsPerPhrase.max}
              value={value.maxWordsPerPhrase}
              onChange={(event) => onChange({ ...value, maxWordsPerPhrase: Number(event.target.value) })}
              className={`mt-1 w-full rounded-2xl border ${wordsError ? "border-red-500 ring-1 ring-red-100" : "border-slate-300"} px-3 py-2 outline-none focus:border-sky-500`}
            />
          </label>
          {wordsError && (
            <p className="mt-1 text-[11px] font-semibold text-red-500 leading-tight">
              Must be between {COMPLEXITY_LIMITS.maxWordsPerPhrase.min} and {COMPLEXITY_LIMITS.maxWordsPerPhrase.max}.
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
