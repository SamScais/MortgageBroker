import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { dataDir, dbPath } from "./paths";
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

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function loadDb(): Database {
  if (isProductionBuild()) {
    return emptyDb();
  }

  mkdirSync(dataDir(), { recursive: true });
  const path = dbPath();
  if (!existsSync(path)) {
    const seeded = ensureSeeded(emptyDb());
    saveDb(seeded);
    return seeded;
  }

  const parsed = JSON.parse(readFileSync(path, "utf8")) as Database;
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
    return seeded;
  }
  return db;
}

export function saveDb(db: Database): void {
  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  renameSync(tmp, path);
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}
