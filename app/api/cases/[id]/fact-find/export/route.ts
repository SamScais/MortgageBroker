import { NextResponse } from "next/server";
import {
  buildConfirmedFactFindExport,
  isExportFormat,
} from "@/lib/fact-find-export";
import { contentDisposition } from "@/lib/pack";
import { getSession } from "@/lib/session";
import { loadDb } from "@/lib/store";

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
  const formatParam = new URL(request.url).searchParams.get("format") ?? "csv";
  if (!isExportFormat(formatParam)) {
    return NextResponse.json(
      { error: "Export format must be csv or json." },
      { status: 400 },
    );
  }

  const db = loadDb();
  const caseRecord = db.cases.find(
    (row) => row.id === id && row.brokerId === session.brokerId,
  );
  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const factFind = db.factFinds.find((row) => row.caseId === id);
  const packed = buildConfirmedFactFindExport(
    factFind?.fields ?? [],
    {
      caseId: caseRecord.id,
      clientLabel: caseRecord.clientLabel,
      kind: "payg",
      exportedAt: new Date().toISOString(),
    },
    formatParam,
  );
  if ("error" in packed) {
    return NextResponse.json({ error: packed.error }, { status: 404 });
  }

  return new NextResponse(packed.body, {
    headers: {
      "Content-Type": packed.contentType,
      "Content-Disposition": contentDisposition(packed.filename, "attachment"),
      "Cache-Control": "private, no-store",
    },
  });
}
