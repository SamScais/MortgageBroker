import { cookies } from "next/headers";
import {
  decodeFactFindOverlay,
  emptyOverlay,
  encodeFactFindOverlay,
  FACT_FIND_OVERLAY_COOKIE,
  runWithFactFindOverlay,
  type FactFindOverlay,
} from "./fact-find-overlay";

const WEEK_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET || "demo-only-session-secret-change-me";
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK_SECONDS,
  };
}

export async function readFactFindOverlayCookie(): Promise<FactFindOverlay> {
  const store = await cookies();
  const raw = store.get(FACT_FIND_OVERLAY_COOKIE)?.value;
  if (!raw) return emptyOverlay();
  return decodeFactFindOverlay(raw, secret()) ?? emptyOverlay();
}

export async function writeFactFindOverlayCookie(
  overlay: FactFindOverlay,
): Promise<void> {
  const store = await cookies();
  store.set(
    FACT_FIND_OVERLAY_COOKIE,
    encodeFactFindOverlay(overlay, secret()),
    cookieOptions(),
  );
}

export async function clearFactFindOverlayCookie(): Promise<void> {
  const store = await cookies();
  store.delete(FACT_FIND_OVERLAY_COOKIE);
}

export async function usingFactFindOverlay<T>(
  fn: () => Promise<T> | T,
): Promise<T> {
  const overlay = await readFactFindOverlayCookie();
  return runWithFactFindOverlay(overlay, fn);
}
