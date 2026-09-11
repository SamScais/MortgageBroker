"use server";

import { revalidatePath } from "next/cache";
import { requireBroker } from "@/lib/auth";
import { nowIso } from "@/lib/crypto";
import { canBrokerReview } from "@/lib/status";
import { loadDb, updateDb } from "@/lib/store";

export async function reviewItemAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireBroker();
  const itemId = String(formData.get("itemId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const db = loadDb();
  const item = db.items.find((row) => row.id === itemId);
  if (!item) return { error: "That checklist item was not found." };

  const caseRecord = db.cases.find(
    (row) => row.id === item.caseId && row.brokerId === session.brokerId,
  );
  if (!caseRecord) return { error: "You cannot review this file." };
  if (!canBrokerReview(item.status)) {
    return { error: "This item is not waiting for review." };
  }

  if (decision !== "accepted" && decision !== "rejected_resubmit") {
    return { error: "Choose accept or request a resubmit." };
  }
  if (decision === "rejected_resubmit" && note.length < 3) {
    return { error: "Add a short note so the client knows what to fix." };
  }

  const updatedAt = nowIso();
  updateDb((next) => {
    const target = next.items.find((row) => row.id === itemId);
    if (!target) return;
    target.status = decision;
    target.brokerNote = note;
    target.reviewedAt = updatedAt;
    target.updatedAt = updatedAt;
  });

  revalidatePath("/broker");
  revalidatePath("/broker/queue");
  revalidatePath(`/broker/cases/${caseRecord.id}`);
  revalidatePath(`/u/${caseRecord.uploadToken}`);
  return null;
}

export async function markNeedsReviewAction(itemId: string) {
  const session = await requireBroker();
  const db = loadDb();
  const item = db.items.find((row) => row.id === itemId);
  if (!item || item.status !== "uploaded") return;
  const caseRecord = db.cases.find(
    (row) => row.id === item.caseId && row.brokerId === session.brokerId,
  );
  if (!caseRecord) return;

  updateDb((next) => {
    const target = next.items.find((row) => row.id === itemId);
    if (!target || target.status !== "uploaded") return;
    target.status = "needs_review";
    target.updatedAt = nowIso();
  });

  revalidatePath("/broker/queue");
  revalidatePath(`/broker/cases/${caseRecord.id}`);
}
