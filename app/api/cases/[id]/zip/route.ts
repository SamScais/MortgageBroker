import { NextResponse } from "next/server";
import { buildCaseZip } from "@/lib/case-zip";
import { contentDisposition, isPackScope, type PackScope } from "@/lib/pack";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await context.params;
  const scopeParam = new URL(request.url).searchParams.get("scope") ?? "accepted";
  if (!isPackScope(scopeParam)) {
    return NextResponse.json(
      { error: "Zip scope must be accepted or all." },
      { status: 400 },
    );
  }
  const scope: PackScope = scopeParam;

  const packed = buildCaseZip(session.brokerId, id, scope);
  if ("error" in packed) {
    return NextResponse.json({ error: packed.error }, { status: packed.status });
  }

  return new NextResponse(new Uint8Array(packed.bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": contentDisposition(packed.filename, "attachment"),
      "Cache-Control": "private, no-store",
    },
  });
}
