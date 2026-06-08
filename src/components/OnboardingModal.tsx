interface OnboardingModalProps { onClose: () => void; }

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Welcome</p>
        <h2 id="onboarding-title" className="mt-1 text-3xl font-black text-slate-950">Set the child&apos;s current communication level</h2>
        <div className="mt-4 space-y-3 text-slate-700"><p><strong>Basic</strong> uses more complete phrases and fewer buttons.</p><p><strong>Intermediate</strong> mixes words and phrases for flexible expression.</p><p><strong>Advanced</strong> adds more individual word tokens to practice longer sentence construction.</p></div>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 font-black text-white">Start building boards</button>
      </div>
    </div>
  );
}
