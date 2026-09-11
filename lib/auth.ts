import { redirect } from "next/navigation";
import { loadDb } from "./store";
import { getSession } from "./session";
import { verifyPassword } from "./crypto";
import type { Broker, SessionPayload } from "./types";

export function findBrokerByEmail(email: string): Broker | undefined {
  const normalised = email.trim().toLowerCase();
  return loadDb().brokers.find((broker) => broker.email === normalised);
}

export function authenticateBroker(
  email: string,
  password: string,
): Broker | null {
  const broker = findBrokerByEmail(email);
  if (!broker) return null;
  if (!verifyPassword(password, broker.passwordHash)) return null;
  return broker;
}

export async function requireBroker(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  const broker = loadDb().brokers.find((row) => row.id === session.brokerId);
  if (!broker) redirect("/login");
  return session;
}
