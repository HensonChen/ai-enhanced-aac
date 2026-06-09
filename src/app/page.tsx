"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BoardReview } from "@/components/BoardReview";
import { CaregiverInput } from "@/components/CaregiverInput";
import { DemoBoardSelector } from "@/components/DemoBoardSelector";
import { GenerationHistory } from "@/components/GenerationHistory";
import { LoadingState } from "@/components/LoadingState";
import { OnboardingModal } from "@/components/OnboardingModal";
import { PersistentVocabEditor } from "@/components/PersistentVocabEditor";
import { SavedBoards } from "@/components/SavedBoards";
import { SentenceStrip } from "@/components/SentenceStrip";
import { VocabGrid } from "@/components/VocabGrid";
import { APP_NAME, DEFAULT_COMPLEXITY, DEFAULT_PREFERENCES } from "@/lib/constants";
import {
  dbLoadContextVocab,
  dbLoadGenerationHistory,
  dbLoadPersistentVocab,
  dbLoadSavedBoards,
  dbRemoveSavedBoard,
  dbSaveBoard,
  dbSaveContextVocab,
  dbSavePersistentVocab,
  dbSaveToHistory,
} from "@/lib/db";
import { inferRoleFromCategory } from "@/lib/roleUtils";
import { speak } from "@/lib/tts";
import { getCachedImage, hasSeenOnboarding, loadPreferences, markOnboardingSeen, savePreferences, setCachedImage } from "@/lib/storage";
import type { GeneratedBoard, ImageProvider, SentenceToken, VocabularyItem } from "@/types";

export default function Home() {
  const [context, setContext] = useState("We are going to a loud grocery store this afternoon.");
  const [complexity, setComplexity] = useState(DEFAULT_COMPLEXITY);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [persistentVocab, setPersistentVocab] = useState<VocabularyItem[]>([]);
  const [contextVocab, setContextVocab] = useState<VocabularyItem[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GeneratedBoard[]>([]);
  const [savedBoards, setSavedBoards] = useState<GeneratedBoard[]>([]);
  const [reviewItems, setReviewItems] = useState<VocabularyItem[]>([]);
  const [reviewContext, setReviewContext] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<SentenceToken[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPersistentEditor, setShowPersistentEditor] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      const loadedPrefs = loadPreferences();
      setPreferences(loadedPrefs);
      setComplexity(loadedPrefs.defaultComplexity);
      setShowOnboarding(!hasSeenOnboarding());

      const [persistent, contextItems, history, saved] = await Promise.all([
        dbLoadPersistentVocab(),
        dbLoadContextVocab(),
        dbLoadGenerationHistory(),
        dbLoadSavedBoards(),
      ]);
      setPersistentVocab(persistent);
      setContextVocab(contextItems);
      setGenerationHistory(history);
      setSavedBoards(saved);
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

  const resolveImages = useCallback(async (items: VocabularyItem[], boardContext: string): Promise<VocabularyItem[]> => {
    return Promise.all(items.map(async (item) => {
      const cached = getCachedImage(item.word, imageProvider);
      if (cached) return { ...item, ...cached };
      try {
        const response = await fetch("/api/resolve-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: item.word, isAbstract: item.isAbstract, context: boardContext, locale: preferences.locale, provider: imageProvider }),
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
  }, [imageProvider, preferences.locale]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setShowReview(false);
    try {
      const response = await fetch("/api/generate-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, complexitySettings: complexity, locale: preferences.locale }),
      });
      if (!response.ok) throw new Error("Could not generate board");
      const data = await response.json();
      const board = data.board as GeneratedBoard;
      const itemsWithRole = board.items.map((item: VocabularyItem) => ({
        ...item,
        role: item.role ?? inferRoleFromCategory(item.category, item.word),
      }));
      const resolved = await resolveImages(itemsWithRole, board.context);
      const finalBoard = { ...board, items: resolved };

      setReviewItems(resolved);
      setReviewContext(board.context);
      setShowReview(true);

      await dbSaveToHistory(finalBoard);
      setGenerationHistory(await dbLoadGenerationHistory());
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleModifyRequest(instruction: string, selectedItems: VocabularyItem[]) {
    setIsModifying(true);
    try {
      const response = await fetch("/api/modify-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          currentItems: reviewItems.map((i) => ({ word: i.word, phrase: i.phrase, category: i.category, role: i.role })),
          selectedItems: selectedItems.map((i) => ({ word: i.word, phrase: i.phrase, category: i.category, role: i.role })),
          context: reviewContext,
        }),
      });
      if (!response.ok) throw new Error("Modification failed");
      const data = await response.json();
      const resolved = await resolveImages(data.items, reviewContext);
      setReviewItems(resolved);

      const modifiedBoard: GeneratedBoard = {
        id: crypto.randomUUID(),
        context: reviewContext,
        timestamp: Date.now(),
        items: resolved,
        complexitySettings: complexity,
        isDemo: false,
      };
      await dbSaveToHistory(modifiedBoard);
      setGenerationHistory(await dbLoadGenerationHistory());
    } catch (modifyError) {
      setError(modifyError instanceof Error ? modifyError.message : "Failed to modify board");
    } finally {
      setIsModifying(false);
    }
  }

  async function handleAcceptReview() {
    setContextVocab(reviewItems);
    await dbSaveContextVocab(reviewItems);
    setShowReview(false);
    setTokens([]);
  }

  async function handleSaveBoardFromReview() {
    const board: GeneratedBoard = {
      id: crypto.randomUUID(),
      context: reviewContext,
      timestamp: Date.now(),
      items: reviewItems,
      complexitySettings: complexity,
      isDemo: false,
    };
    await dbSaveBoard(board);
    setSavedBoards(await dbLoadSavedBoards());
  }

  async function handleLoadBoard(board: GeneratedBoard) {
    const itemsWithRole = board.items.map((item) => ({
      ...item,
      role: item.role ?? inferRoleFromCategory(item.category, item.word),
    }));
    setContextVocab(itemsWithRole);
    await dbSaveContextVocab(itemsWithRole);
    setContext(board.context);
    setShowReview(false);
    setTokens([]);
  }

  async function handleRemoveSavedBoard(id: string) {
    await dbRemoveSavedBoard(id);
    setSavedBoards(await dbLoadSavedBoards());
  }

  async function handleSavePersistentVocab(items: VocabularyItem[]) {
    setPersistentVocab(items);
    await dbSavePersistentVocab(items);
  }

  function handleRemoveContext(id: string) {
    const updated = contextVocab.filter((item) => item.id !== id);
    setContextVocab(updated);
    dbSaveContextVocab(updated);
  }

  function selectItem(item: VocabularyItem) {
    setTokens((current) => [...current, { id: crypto.randomUUID(), word: item.word, phrase: item.phrase, category: item.category }]);
    speak(item.phrase);
  }

  function speakSentence() {
    speak(tokens.map((token) => token.word).join(" "));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-yellow-50 p-4 text-slate-950 sm:p-6 lg:p-8">
      {showOnboarding ? <OnboardingModal onClose={() => { markOnboardingSeen(); setShowOnboarding(false); }} /> : null}
      {showPersistentEditor ? (
        <PersistentVocabEditor
          items={persistentVocab}
          onSave={handleSavePersistentVocab}
          onClose={() => setShowPersistentEditor(false)}
        />
      ) : null}

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 space-y-4 ${
            sidebarOpen
              ? "w-full lg:w-[380px] opacity-100 translate-x-0"
              : "h-0 lg:h-auto w-full lg:w-0 opacity-0 -translate-y-4 lg:-translate-y-0 lg:-translate-x-[380px] pointer-events-none"
          }`}>
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-md mb-2">
              <h1 className="text-xl font-black tracking-tight text-white leading-tight">{APP_NAME}</h1>
              <p className="text-xs font-medium text-slate-300 mt-1.5 leading-snug">Context-aware AAC board with Subject / Verb / Object layout.</p>
            </div>

            <CaregiverInput context={context} complexity={complexity} loading={loading} onContextChange={setContext} onComplexityChange={updateComplexity} onGenerate={handleGenerate} locale={preferences.locale} />

            {/* Persistent vocab editor access */}
            <button
              type="button"
              onClick={() => setShowPersistentEditor(true)}
              className="w-full rounded-[2rem] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
            >
              <p className="text-sm font-bold text-slate-700">Customize Core Vocabulary</p>
              <p className="text-xs text-slate-500 mt-0.5">{persistentVocab.length} persistent words (Subject / Verb / Object)</p>
            </button>

            <DemoBoardSelector onSelect={handleLoadBoard} />
            <GenerationHistory boards={generationHistory} onSelect={handleLoadBoard} />
            <SavedBoards boards={savedBoards} onSelect={handleLoadBoard} onRemove={handleRemoveSavedBoard} />
          </aside>

          {/* Main content */}
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
                  <p className="text-xs font-semibold text-slate-500 mt-1">Subject / Verb / Object board</p>
                </div>
              )}
            </div>

            <SentenceStrip tokens={tokens} onSpeak={speakSentence} onClear={() => setTokens([])} onBackspace={() => setTokens((current) => current.slice(0, -1))} onRemove={(id) => setTokens((current) => current.filter((token) => token.id !== id))} />

            {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div> : null}
            {loading ? <LoadingState count={complexity.maxButtons} /> : null}

            {!loading && showReview ? (
              <BoardReview
                items={reviewItems}
                onItemsChange={setReviewItems}
                onAccept={handleAcceptReview}
                onSaveBoard={handleSaveBoardFromReview}
                onModifyRequest={handleModifyRequest}
                isModifying={isModifying}
                imageProvider={imageProvider}
                locale={preferences.locale}
              />
            ) : null}

            {!loading && !showReview ? (
              <VocabGrid
                persistentItems={persistentVocab}
                contextItems={contextVocab}
                onSelect={selectItem}
                onRemoveContext={handleRemoveContext}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
