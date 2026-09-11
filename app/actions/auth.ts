"use server";

import { redirect } from "next/navigation";
import { authenticateBroker } from "@/lib/auth";
import { clearSession, setSession } from "@/lib/session";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const broker = authenticateBroker(email, password);
  if (!broker) {
    return { error: "Those details did not match the demo broker account." };
  }
  await setSession({
    brokerId: broker.id,
    email: broker.email,
    name: broker.name,
  });
  redirect("/broker");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
