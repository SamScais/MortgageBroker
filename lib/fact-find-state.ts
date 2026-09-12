import type { FactFindField, FactFindFieldState, FactFindRecord } from "./types";

export const FIELD_STATE_LABELS: Record<FactFindFieldState, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  cleared: "Cleared",
};

export type FactFindFieldAction = "confirm" | "edit" | "clear";

export function applyFieldAction(
  field: FactFindField,
  action: FactFindFieldAction,
  nextValue?: string,
): FactFindField {
  if (action === "clear") {
    return {
      ...field,
      state: "cleared",
      value: "",
    };
  }

  if (action === "edit") {
    const value = (nextValue ?? "").trim();
    if (!value) {
      return {
        ...field,
        state: "cleared",
        value: "",
      };
    }
    return {
      ...field,
      state: "confirmed",
      value,
    };
  }

  const restored = field.value.trim() || field.draftValue;
  return {
    ...field,
    state: "confirmed",
    value: restored,
  };
}

export function applyFieldActionToRecord(
  record: FactFindRecord,
  fieldKey: string,
  action: FactFindFieldAction,
  nextValue?: string,
  updatedAt = new Date().toISOString(),
): FactFindRecord {
  return {
    ...record,
    updatedAt,
    fields: record.fields.map((field) =>
      field.key === fieldKey ? applyFieldAction(field, action, nextValue) : field,
    ),
  };
}

export function mergeExtractedFields(
  existing: FactFindField[],
  extracted: FactFindField[],
): FactFindField[] {
  const existingByKey = new Map(existing.map((field) => [field.key, field]));
  const extractedKeys = new Set(extracted.map((field) => field.key));
  const merged: FactFindField[] = [];

  for (const draft of extracted) {
    const prev = existingByKey.get(draft.key);
    if (!prev) {
      merged.push(draft);
      continue;
    }
    if (prev.state === "draft") {
      merged.push({
        ...draft,
        value: prev.value,
        draftValue: draft.draftValue,
        state: "draft",
      });
      continue;
    }
    merged.push({
      ...prev,
      sourceItemKey: draft.sourceItemKey,
      sourceItemTitle: draft.sourceItemTitle,
      sourceFileId: draft.sourceFileId,
      hint: draft.hint,
      draftValue: draft.draftValue,
    });
  }

  for (const prev of existing) {
    if (extractedKeys.has(prev.key)) continue;
    if (prev.state !== "draft") merged.push(prev);
  }

  return merged;
}

export function countFieldStates(fields: FactFindField[]): {
  draft: number;
  confirmed: number;
  cleared: number;
} {
  return fields.reduce(
    (counts, field) => {
      counts[field.state] += 1;
      return counts;
    },
    { draft: 0, confirmed: 0, cleared: 0 },
  );
}
