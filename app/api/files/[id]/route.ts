import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { packedDownloadName, uploadPath } from "@/lib/files";
import { contentDisposition } from "@/lib/pack";
import { findFile, getCaseByToken } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const found = findFile(id);
  if (!found) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const session = await getSession();
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const download = url.searchParams.get("download") === "1";
  const brokerOwns =
    session && session.brokerId === found.caseRecord.brokerId;
  const clientOwns =
    token && getCaseByToken(token)?.id === found.caseRecord.id;

  if (!brokerOwns && !clientOwns) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const path = uploadPath(found.file.storedName);
  if (!path) {
    return NextResponse.json({ error: "File missing on disk." }, { status: 404 });
  }

  const filename = packedDownloadName(
    {
      caseId: found.caseRecord.id,
      docType: found.item.itemKey,
      clientLabel: found.caseRecord.clientLabel,
      status: found.item.status,
      uploadedAt: found.file.uploadedAt,
    },
    found.file.originalName,
  );

  const bytes = await readFile(path);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": found.file.mimeType || "application/octet-stream",
      "Content-Disposition": contentDisposition(
        filename,
        download ? "attachment" : "inline",
      ),
      "Cache-Control": "private, no-store",
    },
  });
}
