import {
  FACT_FIND_GROUPS,
  type FactFindField,
  type FactFindFieldState,
  type FactFindGroupId,
  type FactFindRecord,
} from "./types";

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
  confirmedAt = new Date().toISOString(),
): FactFindField {
  if (action === "clear") {
    return {
      ...field,
      state: "cleared",
      value: "",
      confirmedAt: null,
    };
  }

  if (action === "edit") {
    const value = (nextValue ?? "").trim();
    if (!value) {
      return {
        ...field,
        state: "cleared",
        value: "",
        confirmedAt: null,
      };
    }
    return {
      ...field,
      state: "confirmed",
      value,
      confirmedAt,
    };
  }

  const restored = field.value.trim() || field.draftValue;
  return {
    ...field,
    state: "confirmed",
    value: restored,
    confirmedAt,
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
      field.key === fieldKey
        ? applyFieldAction(field, action, nextValue, updatedAt)
        : field,
    ),
  };
}

export type BulkConfirmScope = "all" | "group";

export type BulkConfirmFilter = {
  group?: FactFindGroupId;
};

export function isFactFindGroupId(value: string): value is FactFindGroupId {
  return (FACT_FIND_GROUPS as readonly string[]).includes(value);
}

/** Draft fields currently on the fact-find. Cleared and confirmed stay out. */
export function confirmableDrafts(
  fields: FactFindField[],
  filter?: BulkConfirmFilter,
): FactFindField[] {
  return fields.filter(
    (field) =>
      field.state === "draft" &&
      (filter?.group == null || field.group === filter.group),
  );
}

export function applyDraftConfirmsToRecord(
  record: FactFindRecord,
  filter?: BulkConfirmFilter,
  updatedAt = new Date().toISOString(),
): { record: FactFindRecord; confirmedKeys: string[] } {
  const keys = new Set(confirmableDrafts(record.fields, filter).map((field) => field.key));
  if (keys.size === 0) {
    return { record, confirmedKeys: [] };
  }
  return {
    record: {
      ...record,
      updatedAt,
      fields: record.fields.map((field) =>
        keys.has(field.key)
          ? applyFieldAction(field, "confirm", undefined, updatedAt)
          : field,
      ),
    },
    confirmedKeys: [...keys],
  };
}

export type ParsedBulkConfirm =
  | {
      ok: true;
      caseId: string;
      scope: BulkConfirmScope;
      group?: FactFindGroupId;
    }
  | { ok: false; error: string };

export function parseBulkConfirmForm(formData: FormData): ParsedBulkConfirm {
  const caseId = String(formData.get("caseId") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const group = String(formData.get("group") ?? "").trim();
  const acknowledged =
    formData.get("acknowledged") === "1" || formData.get("acknowledged") === "on";

  if (!caseId) {
    return { ok: false, error: "Missing case." };
  }
  if (scope !== "all" && scope !== "group") {
    return { ok: false, error: "Choose confirm all or confirm group." };
  }
  if (scope === "group" && !isFactFindGroupId(group)) {
    return { ok: false, error: "Choose a fact-find group." };
  }
  if (!acknowledged) {
    return {
      ok: false,
      error: "Tick “I have checked these draft values” before confirming.",
    };
  }
  return {
    ok: true,
    caseId,
    scope,
    ...(scope === "group" && isFactFindGroupId(group) ? { group } : {}),
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
