import type { ItemStatus } from "./types";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  needed: "Needed",
  uploaded: "Uploaded",
  needs_review: "Needs review",
  accepted: "Accepted",
  rejected_resubmit: "Rejected — resubmit",
};

export const REVIEW_QUEUE_STATUSES: ItemStatus[] = [
  "uploaded",
  "needs_review",
];

export const OUTSTANDING_STATUSES: ItemStatus[] = [
  "needed",
  "rejected_resubmit",
];

export function canClientUpload(status: ItemStatus): boolean {
  return status === "needed" || status === "rejected_resubmit";
}

export function statusAfterClientUpload(status: ItemStatus): ItemStatus | null {
  if (!canClientUpload(status)) return null;
  return "uploaded";
}

export function canBrokerReview(status: ItemStatus): boolean {
  return status === "uploaded" || status === "needs_review";
}

export function isOverdue(dueAt: string, now = new Date()): boolean {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < now.getTime();
}

export function caseNeedsAttention(itemStatuses: ItemStatus[]): boolean {
  return itemStatuses.some((status) => REVIEW_QUEUE_STATUSES.includes(status));
}

export function caseIsOutstanding(itemStatuses: ItemStatus[]): boolean {
  return itemStatuses.some((status) => OUTSTANDING_STATUSES.includes(status));
}
