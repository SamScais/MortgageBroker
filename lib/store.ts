import { dirname } from "node:path";
import { isProductionBuild } from "./build-phase";
import {
  applyOverlayToDb,
  requestFactFindOverlay,
} from "./fact-find-overlay";
import { dataDir, dbPath } from "./paths";
import {
  fileExists,
  makeDir,
  readUtf8,
  renameFile,
  writeBytes,
} from "./runtime-fs";
import { ensureSeeded } from "./seed-data";
import type { Database } from "./types";

function emptyDb(): Database {
  return {
    brokers: [],
    cases: [],
    items: [],
    files: [],
    reminders: [],
    factFinds: [],
  };
}

export function loadDb(): Database {
  if (isProductionBuild()) {
    return emptyDb();
  }

  makeDir(dataDir());
  const path = dbPath();
  if (!fileExists(path)) {
    const seeded = ensureSeeded(emptyDb());
    saveDb(seeded);
    return applyOverlayToDb(seeded, requestFactFindOverlay());
  }

  const parsed = JSON.parse(readUtf8(path)) as Database;
  const db: Database = {
    brokers: parsed.brokers ?? [],
    cases: parsed.cases ?? [],
    items: parsed.items ?? [],
    files: parsed.files ?? [],
    reminders: parsed.reminders ?? [],
    factFinds: parsed.factFinds ?? [],
  };

  if (db.brokers.length === 0) {
    const seeded = ensureSeeded(db);
    saveDb(seeded);
    return applyOverlayToDb(seeded, requestFactFindOverlay());
  }
  return applyOverlayToDb(db, requestFactFindOverlay());
}

export function saveDb(db: Database): void {
  if (isProductionBuild()) return;
  const path = dbPath();
  makeDir(dirname(path));
  const tmp = `${path}.tmp`;
  writeBytes(tmp, JSON.stringify(db, null, 2));
  renameFile(tmp, path);
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}
