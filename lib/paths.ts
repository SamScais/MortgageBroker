import { tmpdir } from "node:os";
import { join } from "node:path";

export const ROOT = process.cwd();

const PREVIEW_DIR_NAME = "mortgage-broker-intake";

/** Env bag so tests can pass a fake process.env without mutating globals. */
export type PathEnv = NodeJS.ProcessEnv;

/**
 * Vercel (and other serverless hosts) set VERCEL=1. The project directory
 * is read-only there, so SAMPLE data must live under the writable temp dir.
 */
export function usesEphemeralStorage(env: PathEnv = process.env): boolean {
  return Boolean(env.VERCEL || env.VERCEL_ENV);
}

export function dataDir(env: PathEnv = process.env): string {
  if (env.DATA_DIR) return env.DATA_DIR;
  if (usesEphemeralStorage(env)) {
    return join(tmpdir(), PREVIEW_DIR_NAME);
  }
  return join(process.cwd(), "data");
}

export function dbPath(env: PathEnv = process.env): string {
  if (env.DATABASE_PATH) return env.DATABASE_PATH;
  return join(dataDir(env), "db.json");
}

export function uploadDir(env: PathEnv = process.env): string {
  if (env.UPLOAD_DIR) return env.UPLOAD_DIR;
  return join(dataDir(env), "uploads");
}

export function appUrl(env: PathEnv = process.env): string {
  const explicit = env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = env.VERCEL_URL;
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

export function clientUploadUrl(
  token: string,
  env: PathEnv = process.env,
): string {
  return `${appUrl(env)}/u/${token}`;
}
