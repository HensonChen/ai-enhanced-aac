import { openDB, type IDBPDatabase } from "idb";
import type { GeneratedBoard, VocabularyItem } from "@/types";
import { DEFAULT_PERSISTENT_VOCAB } from "./coreVocabulary";
import { inferRoleFromCategory } from "./roleUtils";

const DB_NAME = "aac-board-db";
const DB_VERSION = 1;

const STORES = {
  persistentVocab: "persistent-vocab",
  contextVocab: "context-vocab",
  generationHistory: "generation-history",
  savedBoards: "saved-boards",
  images: "images",
} as const;

const GENERATION_HISTORY_CAP = 50;

interface ImageRecord {
  key: string;
  blob: Blob;
  url?: string;
  source: string;
  format: string;
  isAnimated: boolean;
}

let dbInstance: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.persistentVocab)) {
        db.createObjectStore(STORES.persistentVocab, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.contextVocab)) {
        db.createObjectStore(STORES.contextVocab, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.generationHistory)) {
        db.createObjectStore(STORES.generationHistory, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.savedBoards)) {
        db.createObjectStore(STORES.savedBoards, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.images)) {
        db.createObjectStore(STORES.images, { keyPath: "key" });
      }
    },
  });
  return dbInstance;
}

function migrateItemRole(item: VocabularyItem): VocabularyItem {
  if (item.role) return item;
  return { ...item, role: inferRoleFromCategory(item.category, item.word) };
}

// --- Persistent Vocabulary ---

export async function dbLoadPersistentVocab(): Promise<VocabularyItem[]> {
  try {
    const db = await getDb();
    const items = await db.getAll(STORES.persistentVocab);
    if (items.length === 0) {
      await dbSavePersistentVocab(DEFAULT_PERSISTENT_VOCAB);
      return DEFAULT_PERSISTENT_VOCAB;
    }
    return items.map(migrateItemRole);
  } catch {
    return DEFAULT_PERSISTENT_VOCAB;
  }
}

export async function dbSavePersistentVocab(items: VocabularyItem[]): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction(STORES.persistentVocab, "readwrite");
    await tx.store.clear();
    for (const item of items) {
      await tx.store.put(item);
    }
    await tx.done;
  } catch (e) {
    console.error("Failed to save persistent vocab:", e);
  }
}

// --- Context Vocabulary ---

export async function dbLoadContextVocab(): Promise<VocabularyItem[]> {
  try {
    const db = await getDb();
    const items = await db.getAll(STORES.contextVocab);
    return items.map(migrateItemRole);
  } catch {
    return [];
  }
}

export async function dbSaveContextVocab(items: VocabularyItem[]): Promise<void> {
  try {
    const db = await getDb();
    const tx = db.transaction(STORES.contextVocab, "readwrite");
    await tx.store.clear();
    for (const item of items) {
      await tx.store.put(item);
    }
    await tx.done;
  } catch (e) {
    console.error("Failed to save context vocab:", e);
  }
}

// --- Generation History ---

export async function dbLoadGenerationHistory(): Promise<GeneratedBoard[]> {
  try {
    const db = await getDb();
    const boards = await db.getAll(STORES.generationHistory);
    return boards
      .map((b) => ({ ...b, items: b.items.map(migrateItemRole) }))
      .sort((a: GeneratedBoard, b: GeneratedBoard) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function dbSaveToHistory(board: GeneratedBoard): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORES.generationHistory, board);
    const all = await db.getAll(STORES.generationHistory);
    if (all.length > GENERATION_HISTORY_CAP) {
      const sorted = all.sort((a: GeneratedBoard, b: GeneratedBoard) => b.timestamp - a.timestamp);
      const toDelete = sorted.slice(GENERATION_HISTORY_CAP);
      const tx = db.transaction(STORES.generationHistory, "readwrite");
      for (const entry of toDelete) {
        await tx.store.delete(entry.id);
      }
      await tx.done;
    }
  } catch (e) {
    console.error("Failed to save to generation history:", e);
  }
}

// --- Saved Boards ---

export async function dbLoadSavedBoards(): Promise<GeneratedBoard[]> {
  try {
    const db = await getDb();
    const boards = await db.getAll(STORES.savedBoards);
    return boards
      .map((b) => ({ ...b, items: b.items.map(migrateItemRole) }))
      .sort((a: GeneratedBoard, b: GeneratedBoard) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function dbSaveBoard(board: GeneratedBoard): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORES.savedBoards, board);
  } catch (e) {
    console.error("Failed to save board:", e);
  }
}

export async function dbRemoveSavedBoard(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORES.savedBoards, id);
  } catch (e) {
    console.error("Failed to remove saved board:", e);
  }
}

// --- Image Cache ---

export async function dbGetImage(key: string): Promise<{ url: string; source: string; format: string; isAnimated: boolean } | null> {
  try {
    const db = await getDb();
    const record = await db.get(STORES.images, key) as ImageRecord | undefined;
    if (!record) return null;
    if (record.url) return { url: record.url, source: record.source, format: record.format, isAnimated: record.isAnimated };
    const url = URL.createObjectURL(record.blob);
    return { url, source: record.source, format: record.format, isAnimated: record.isAnimated };
  } catch {
    return null;
  }
}

export async function dbPutImage(key: string, data: { url: string; source: string; format: string; isAnimated: boolean }): Promise<void> {
  try {
    const db = await getDb();
    const record: ImageRecord = {
      key,
      blob: new Blob(),
      url: data.url,
      source: data.source,
      format: data.format,
      isAnimated: data.isAnimated,
    };
    await db.put(STORES.images, record);
  } catch (e) {
    console.error("Failed to cache image:", e);
  }
}
