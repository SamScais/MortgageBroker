"use server";

import { revalidatePath } from "next/cache";
import { requireBroker } from "@/lib/auth";
import { applyStoredFieldAction, syncFactFindOnDb } from "@/lib/fact-find";
import type { FactFindFieldAction } from "@/lib/fact-find-state";
import { loadDb, updateDb } from "@/lib/store";

function revalidateFactFind(caseId: string) {
  revalidatePath("/broker");
  revalidatePath(`/broker/cases/${caseId}`);
  revalidatePath(`/broker/cases/${caseId}/fact-find`);
}

export async function factFindFieldAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireBroker();
  const caseId = String(formData.get("caseId") ?? "");
  const fieldKey = String(formData.get("fieldKey") ?? "");
  const action = String(formData.get("action") ?? "") as FactFindFieldAction;
  const value = String(formData.get("value") ?? "");

  if (action !== "confirm" && action !== "edit" && action !== "clear") {
    return { error: "Choose confirm, edit or clear." };
  }

  const db = loadDb();
  const caseRecord = db.cases.find(
    (row) => row.id === caseId && row.brokerId === session.brokerId,
  );
  if (!caseRecord) return { error: "You cannot edit this fact-find." };

  const updated = updateDb((next) => {
    const current = next.cases.find((row) => row.id === caseId);
    if (!current) return null;
    syncFactFindOnDb(
      next,
      current,
      next.items.filter((row) => row.caseId === caseId),
      next.files,
    );
    return applyStoredFieldAction(next, caseId, fieldKey, action, value);
  });

  if (!updated) return { error: "That field was not found on this draft." };
  revalidateFactFind(caseId);
  return null;
}
