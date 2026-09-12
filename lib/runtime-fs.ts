/**
 * Disk helpers used only at request / seed time.
 *
 * Next/Turbopack traces `existsSync(dynamicPath)` as "the whole project".
 * Every path argument is marked so the tracer does not bundle the repo.
 * During `next build` these are no-ops so compile never hits disk.
 */
import {
  createWriteStream as createWriteStreamFs,
  existsSync as existsSyncFs,
  mkdirSync as mkdirSyncFs,
  readFileSync as readFileSyncFs,
  renameSync as renameSyncFs,
  writeFileSync as writeFileSyncFs,
  type WriteStream,
} from "node:fs";
import { readFile as readFileFs } from "node:fs/promises";
import { isProductionBuild } from "./build-phase";

export function fileExists(path: string): boolean {
  if (isProductionBuild()) return false;
  return existsSyncFs(/*turbopackIgnore: true*/ path);
}

export function makeDir(path: string): void {
  if (isProductionBuild()) return;
  mkdirSyncFs(/*turbopackIgnore: true*/ path, { recursive: true });
}

export function readUtf8(path: string): string {
  return readFileSyncFs(/*turbopackIgnore: true*/ path, "utf8");
}

export function readBytes(path: string): Buffer {
  return readFileSyncFs(/*turbopackIgnore: true*/ path);
}

export async function readBytesAsync(path: string): Promise<Buffer> {
  return readFileFs(/*turbopackIgnore: true*/ path);
}

export function writeBytes(path: string, data: string | Buffer): void {
  if (isProductionBuild()) return;
  writeFileSyncFs(/*turbopackIgnore: true*/ path, data);
}

export function renameFile(from: string, to: string): void {
  if (isProductionBuild()) return;
  renameSyncFs(
    /*turbopackIgnore: true*/ from,
    /*turbopackIgnore: true*/ to,
  );
}

export function openWriteStream(path: string): WriteStream {
  return createWriteStreamFs(/*turbopackIgnore: true*/ path);
}
