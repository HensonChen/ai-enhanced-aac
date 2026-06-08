"use client";

import { useEffect, useMemo, useState } from "react";
import { BoardHistory } from "@/components/BoardHistory";
import { BoardPreview } from "@/components/BoardPreview";
import { CaregiverInput } from "@/components/CaregiverInput";
import { DemoBoardSelector } from "@/components/DemoBoardSelector";
import { EmotionalPanel } from "@/components/EmotionalPanel";
import { LoadingState } from "@/components/LoadingState";
import { OnboardingModal } from "@/components/OnboardingModal";
import { SentenceStrip } from "@/components/SentenceStrip";
import { VocabGrid } from "@/components/VocabGrid";
import { APP_NAME, DEFAULT_COMPLEXITY, DEFAULT_PREFERENCES } from "@/lib/constants";
import { speak } from "@/lib/tts";
import { getCachedImage, hasSeenOnboarding, loadBoardHistory, loadPreferences, markOnboardingSeen, saveBoardToHistory, savePreferences, setCachedImage } from "@/lib/storage";
import type { GeneratedBoard, ImageProvider, SentenceToken, VocabularyItem } from "@/types";

export default function Home() {
  const [context, setContext] = useState("We are going to a loud grocery store this afternoon.");
  const [complexity, setComplexity] = useState(DEFAULT_COMPLEXITY);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [history, setHistory] = useState<GeneratedBoard[]>([]);
  const [activeBoard, setActiveBoard] = useState<GeneratedBoard | null>(null);
  const [previewItems, setPreviewItems] = useState<VocabularyItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<SentenceToken[]>([]);
  const [feelingsOpen, setFeelingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const loadedPrefs = loadPreferences();
      setPreferences(loadedPrefs);
      setComplexity(loadedPrefs.defaultComplexity);
      setHistory(loadBoardHistory());
      setShowOnboarding(!hasSeenOnboarding());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const imageProvider = useMemo<ImageProvider>(() => preferences.imageProvider ?? "gpt-image-mini", [preferences.imageProvider]);

  function updateComplexity(next: typeof complexity) {
    setComplexity(next);
    const nextPreferences = { ...preferences, defaultComplexity: next };
    setPreferences(nextPreferences);
    savePreferences(nextPreferences);
  }

  async function resolveImages(board: GeneratedBoard) {
    const resolvedItems = await Promise.all(board.items.map(async (item) => {
      const cached = getCachedImage(item.word, imageProvider);
      if (cached) return { ...item, ...cached };
      try {
        const response = await fetch("/api/resolve-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: item.word, isAbstract: item.isAbstract, context: board.context, locale: preferences.locale, provider: imageProvider }),
        });
        if (!response.ok) return item;
        const image = await response.json();
        const merged = { imageUrl: image.url, imageSource: image.source, imageFormat: image.format, isAnimated: image.isAnimated };
        setCachedImage(item.word, imageProvider, merged);
        return { ...item, ...merged };
      } catch {
        return item;
      }
    }));
    return { ...board, items: resolvedItems };
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setShowPreview(false);
    try {
      const response = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, complexitySettings: complexity, locale: preferences.locale }),
      });
      if (!response.ok) throw new Error("Could not generate board");
      const data = await response.json();
      const board = await resolveImages(data.board as GeneratedBoard);
      setActiveBoard(board);
      setPreviewItems(board.items);
      setShowPreview(true);
      saveBoardToHistory(board);
      setHistory(loadBoardHistory());
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function activateBoard(board: GeneratedBoard) {
    setActiveBoard(board);
    setPreviewItems(board.items);
    setShowPreview(false);
    setContext(board.context);
    setTokens([]);
  }

  function selectItem(item: VocabularyItem) {
    setTokens((current) => [...current, { id: crypto.randomUUID(), word: item.word, phrase: item.phrase, category: item.category }]);
    speak(item.phrase);
  }

  function speakSentence() {
    speak(tokens.map((token) => token.word).join(" "));
  }

  const visibleItems = showPreview ? previewItems : activeBoard?.items ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-yellow-50 p-4 text-slate-950 sm:p-6 lg:p-8">
      {showOnboarding ? <OnboardingModal onClose={() => { markOnboardingSeen(); setShowOnboarding(false); }} /> : null}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 space-y-4 ${
            sidebarOpen 
              ? "w-full lg:w-[380px] opacity-100 translate-x-0" 
              : "h-0 lg:h-auto w-full lg:w-0 opacity-0 -translate-y-4 lg:-translate-y-0 lg:-translate-x-[380px] pointer-events-none"
          }`}>
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-md mb-2">
              <h1 className="text-xl font-black tracking-tight text-white leading-tight">{APP_NAME}</h1>
              <p className="text-xs font-medium text-slate-300 mt-1.5 leading-snug">Context-aware AAC board: build and speak sentences with color-coded buttons.</p>
            </div>
            <CaregiverInput context={context} complexity={complexity} loading={loading} onContextChange={setContext} onComplexityChange={updateComplexity} onGenerate={handleGenerate} locale={preferences.locale} />
            <DemoBoardSelector onSelect={activateBoard} />
            <BoardHistory boards={history} onSelect={activateBoard} />
          </aside>

          <section className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="inline-flex items-center justify-center rounded-2xl bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                title={sidebarOpen ? "Hide settings" : "Show settings"}
                aria-label={sidebarOpen ? "Hide settings" : "Show settings"}
              >
                {sidebarOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              
              {!sidebarOpen && (
                <div className="flex flex-col">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 leading-none">{APP_NAME}</h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Context-aware AAC board</p>
                </div>
              )}
            </div>

            <SentenceStrip tokens={tokens} onSpeak={speakSentence} onClear={() => setTokens([])} onBackspace={() => setTokens((current) => current.slice(0, -1))} onRemove={(id) => setTokens((current) => current.filter((token) => token.id !== id))} />
            {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}
            {loading ? <LoadingState count={complexity.maxButtons} /> : null}
            {!loading && showPreview ? <BoardPreview items={previewItems} onItemsChange={setPreviewItems} onUseBoard={() => activeBoard && activateBoard({ ...activeBoard, items: previewItems })} imageProvider={imageProvider} locale={preferences.locale} /> : null}
            {!loading && !showPreview ? <VocabGrid items={visibleItems} onSelect={selectItem} /> : null}
            <EmotionalPanel open={feelingsOpen} onToggle={() => setFeelingsOpen((open) => !open)} onSelect={selectItem} />
          </section>
        </div>
      </div>
    </main>
  );
}
