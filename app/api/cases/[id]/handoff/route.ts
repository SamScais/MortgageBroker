import { NextResponse } from "next/server";
import { usingFactFindOverlay } from "@/lib/fact-find-cookie";
import { buildHandoffZip } from "@/lib/fact-find-handoff";
import { contentDisposition } from "@/lib/pack";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await context.params;
  const packed = await usingFactFindOverlay(() =>
    buildHandoffZip(session.brokerId, id),
  );
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
