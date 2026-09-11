import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { uploadPath } from "@/lib/files";
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
  const token = new URL(request.url).searchParams.get("token") ?? "";
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

  const bytes = await readFile(path);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": found.file.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${found.file.originalName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
