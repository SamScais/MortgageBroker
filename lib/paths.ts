import { join } from "node:path";

export const ROOT = process.cwd();
export const DATA_DIR = join(process.cwd(), "data");
export const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), "data", "db.json");
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || join(process.cwd(), "data", "uploads");

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function clientUploadUrl(token: string): string {
  return `${appUrl()}/u/${token}`;
}
