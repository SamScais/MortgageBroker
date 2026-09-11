import { caseIsOutstanding, isOverdue } from "./status";
import type { CaseRecord, ChecklistItem, ItemStatus } from "./types";

export function caseIsOverdue(
  caseRecord: Pick<CaseRecord, "dueAt">,
  items: Array<Pick<ChecklistItem, "status">>,
  now = new Date(),
): boolean {
  if (!isOverdue(caseRecord.dueAt, now)) return false;
  return caseIsOutstanding(items.map((item) => item.status as ItemStatus));
}

export function buildReminderEmail(input: {
  clientLabel: string;
  clientEmail: string;
  scenarioName: string;
  dueAt: string;
  outstandingTitles: string[];
  uploadUrl: string;
}): { subject: string; body: string } {
  const due = new Date(input.dueAt);
  const dueText = Number.isNaN(due.getTime())
    ? input.dueAt
    : due.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const list =
    input.outstandingTitles.length > 0
      ? input.outstandingTitles.map((title) => `• ${title}`).join("\n")
      : "• Outstanding documents on your checklist";

  return {
    subject: `Reminder: documents still needed for your home loan file (${input.scenarioName})`,
    body: [
      `Hello ${input.clientLabel},`,
      "",
      `This is a reminder from your broker that some documents are still needed for your ${input.scenarioName.toLowerCase()} file. Please upload them by ${dueText}.`,
      "",
      "Still needed:",
      list,
      "",
      `Upload here: ${input.uploadUrl}`,
      "",
      "This message is a DEMO / SAMPLE reminder. It was not sent to a real inbox.",
      "",
      "This tool does not provide financial advice.",
    ].join("\n"),
  };
}
