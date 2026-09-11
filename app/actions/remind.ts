"use server";

import { revalidatePath } from "next/cache";
import { requireBroker } from "@/lib/auth";
import { newId, nowIso } from "@/lib/crypto";
import { clientUploadUrl } from "@/lib/paths";
import { buildReminderEmail } from "@/lib/reminders";
import { getScenario } from "@/lib/scenarios";
import { loadDb, updateDb } from "@/lib/store";

export async function sendReminderAction(
  _prev: { error?: string; ok?: string } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: string } | null> {
  const session = await requireBroker();
  const caseId = String(formData.get("caseId") ?? "");
  const db = loadDb();
  const caseRecord = db.cases.find(
    (row) => row.id === caseId && row.brokerId === session.brokerId,
  );
  if (!caseRecord) return { error: "Case not found." };

  const items = db.items.filter((item) => item.caseId === caseId);
  const outstanding = items.filter(
    (item) =>
      item.status === "needed" || item.status === "rejected_resubmit",
  );
  if (outstanding.length === 0) {
    return { error: "Nothing outstanding to remind about on this file." };
  }

  const scenario = getScenario(caseRecord.scenarioId);
  const email = buildReminderEmail({
    clientLabel: caseRecord.clientLabel,
    clientEmail: caseRecord.clientEmail,
    scenarioName: scenario?.name ?? caseRecord.scenarioId,
    dueAt: caseRecord.dueAt,
    outstandingTitles: outstanding.map((item) => item.title),
    uploadUrl: clientUploadUrl(caseRecord.uploadToken),
  });

  updateDb((next) => {
    next.reminders.push({
      id: newId(),
      caseId: caseRecord.id,
      sentAt: nowIso(),
      channel: "demo_email",
      to: caseRecord.clientEmail,
      subject: email.subject,
      body: email.body,
      isDemo: true,
    });
  });

  revalidatePath("/broker/reminders");
  revalidatePath(`/broker/cases/${caseRecord.id}`);
  return {
    ok: "DEMO reminder logged. Nothing was sent to a real inbox.",
  };
}
