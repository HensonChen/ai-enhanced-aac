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

  const imageProvider = useMemo<ImageProvider>(() => preferences.imageProvider ?? "dalle", [preferences.imageProvider]);

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
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-200">Prototype MVP</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{APP_NAME}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-200">Generate context-aware AAC vocabulary, pair it with symbols, and let children build spoken sentences by tapping large color-coded buttons.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <CaregiverInput context={context} complexity={complexity} loading={loading} onContextChange={setContext} onComplexityChange={updateComplexity} onGenerate={handleGenerate} />
            <DemoBoardSelector onSelect={activateBoard} />
            <BoardHistory boards={history} onSelect={activateBoard} />
          </aside>

          <section className="space-y-4">
            <SentenceStrip tokens={tokens} onSpeak={speakSentence} onClear={() => setTokens([])} onBackspace={() => setTokens((current) => current.slice(0, -1))} onRemove={(id) => setTokens((current) => current.filter((token) => token.id !== id))} />
            {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}
            {loading ? <LoadingState /> : null}
            {!loading && showPreview ? <BoardPreview items={previewItems} onItemsChange={setPreviewItems} onUseBoard={() => activeBoard && activateBoard({ ...activeBoard, items: previewItems })} /> : null}
            {!loading && !showPreview ? <VocabGrid items={visibleItems} onSelect={selectItem} /> : null}
            <EmotionalPanel open={feelingsOpen} onToggle={() => setFeelingsOpen((open) => !open)} onSelect={selectItem} />
          </section>
        </div>
      </div>
    </main>
  );
}
