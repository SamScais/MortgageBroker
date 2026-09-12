import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { DB_PATH, DATA_DIR } from "./paths";
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
  mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    const seeded = ensureSeeded(emptyDb());
    saveDb(seeded);
    return seeded;
  }

  const parsed = JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
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
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  renameSync(tmp, DB_PATH);
}

export function updateDb<T>(fn: (db: Database) => T): T {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}
