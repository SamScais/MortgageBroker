import { NextResponse } from "next/server";
import { newId, nowIso } from "@/lib/crypto";
import { saveUpload } from "@/lib/files";
import { getCaseByToken } from "@/lib/queries";
import { statusAfterClientUpload } from "@/lib/status";
import { updateDb } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Choose a file to upload." },
      { status: 400 },
    );
  }

  const caseRecord = getCaseByToken(token);
  if (!caseRecord) {
    return NextResponse.json(
      { error: "This upload link is not valid." },
      { status: 404 },
    );
  }

  try {
    const saved = await saveUpload(file);
    const result = updateDb((db) => {
      const item = db.items.find(
        (row) => row.id === itemId && row.caseId === caseRecord.id,
      );
      if (!item) return { error: "That checklist item was not found." };
      const nextStatus = statusAfterClientUpload(item.status);
      if (!nextStatus) {
        return {
          error:
            "This item cannot be uploaded right now. If it is already in review, wait for your broker.",
        };
      }
      const uploadedAt = nowIso();
      db.files.push({
        id: newId(),
        itemId: item.id,
        originalName: file.name,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        uploadedAt,
      });
      item.status = nextStatus;
      item.updatedAt = uploadedAt;
      return { ok: true };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed. Try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
