import { cookies } from "next/headers";
import { signValue, verifySignedValue } from "./crypto";
import type { SessionPayload } from "./types";

const COOKIE = "mb_session";
const WEEK_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return (
    process.env.SESSION_SECRET || "demo-only-session-secret-change-me"
  );
}

export function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return signValue(body, secret());
}

export function decodeSession(signed: string): SessionPayload | null {
  const body = verifySignedValue(signed, secret());
  if (!body) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!parsed.brokerId || !parsed.email || !parsed.exp) return null;
    if (parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function setSession(payload: Omit<SessionPayload, "exp">) {
  const store = await cookies();
  const exp = Math.floor(Date.now() / 1000) + WEEK_SECONDS;
  store.set(COOKIE, encodeSession({ ...payload, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
  const { clearFactFindOverlayCookie } = await import("./fact-find-cookie");
  await clearFactFindOverlayCookie();
}

export function hasSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${COOKIE}=`));
}
