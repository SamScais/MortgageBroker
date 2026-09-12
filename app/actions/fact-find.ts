"use server";

import { revalidatePath } from "next/cache";
import { requireBroker } from "@/lib/auth";
import {
  readFactFindOverlayCookie,
  usingFactFindOverlay,
  writeFactFindOverlayCookie,
} from "@/lib/fact-find-cookie";
import { applyStoredFieldAction, syncFactFindOnDb } from "@/lib/fact-find";
import { replaceCaseOverlay } from "@/lib/fact-find-overlay";
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

  const overlay = await readFactFindOverlayCookie();
  const updated = await usingFactFindOverlay(() => {
    const db = loadDb();
    const caseRecord = db.cases.find(
      (row) => row.id === caseId && row.brokerId === session.brokerId,
    );
    if (!caseRecord) return { error: "You cannot edit this fact-find." as const };

    const next = updateDb((draft) => {
      const current = draft.cases.find((row) => row.id === caseId);
      if (!current) return null;
      syncFactFindOnDb(
        draft,
        current,
        draft.items.filter((row) => row.caseId === caseId),
        draft.files,
      );
      return applyStoredFieldAction(draft, caseId, fieldKey, action, value);
    });

    if (!next) return { error: "That field was not found on this draft." as const };
    return { record: next };
  });

  if ("error" in updated) {
    return { error: updated.error ?? "That field was not found on this draft." };
  }

  await writeFactFindOverlayCookie(
    replaceCaseOverlay(overlay, caseId, updated.record.fields, session.brokerId),
  );
  revalidateFactFind(caseId);
  return null;
}
