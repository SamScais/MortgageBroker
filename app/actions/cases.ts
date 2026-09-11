"use server";

import { redirect } from "next/navigation";
import { requireBroker } from "@/lib/auth";
import { newId, newUploadToken, nowIso } from "@/lib/crypto";
import { isScenarioId } from "@/lib/scenarios";
import { getScenario } from "@/lib/scenarios";
import { labelSampleClient } from "@/lib/sample-label";
import { updateDb } from "@/lib/store";
import type { ChecklistItem } from "@/lib/types";

export async function createCaseAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireBroker();
  const rawName = String(formData.get("clientName") ?? "");
  const clientEmail = String(formData.get("clientEmail") ?? "")
    .trim()
    .toLowerCase();
  const clientMobile = String(formData.get("clientMobile") ?? "").trim();
  const scenarioId = String(formData.get("scenarioId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const dueDate = String(formData.get("dueAt") ?? "");

  if (!rawName.trim()) return { error: "Enter a sample client name." };
  if (!clientEmail || !clientEmail.includes("@")) {
    return { error: "Enter a sample email address." };
  }
  if (!isScenarioId(scenarioId)) {
    return { error: "Choose a loan scenario." };
  }

  const due = new Date(`${dueDate}T17:00:00`);
  if (!dueDate || Number.isNaN(due.getTime())) {
    return { error: "Choose a due date." };
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) return { error: "Choose a loan scenario." };

  const createdAt = nowIso();
  const caseId = newId();

  updateDb((db) => {
    db.cases.push({
      id: caseId,
      brokerId: session.brokerId,
      clientLabel: labelSampleClient(rawName),
      clientEmail,
      clientMobile,
      scenarioId,
      notes,
      uploadToken: newUploadToken(),
      dueAt: due.toISOString(),
      createdAt,
    });

    const items: ChecklistItem[] = scenario.items.map((item) => ({
      id: newId(),
      caseId,
      itemKey: item.key,
      title: item.title,
      description: item.description,
      status: "needed",
      brokerNote: "",
      reviewedAt: null,
      createdAt,
      updatedAt: createdAt,
    }));
    db.items.push(...items);
  });

  redirect(`/broker/cases/${caseId}`);
}
