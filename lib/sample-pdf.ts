/** Minimal one-page PDF labelled SAMPLE / FAKE for demo uploads. */
export function samplePdfBytes(title: string): Buffer {
  const safe = title.replace(/[()\\]/g, " ");
  const stream = [
    "BT",
    "/F1 16 Tf",
    "50 760 Td",
    "(SAMPLE / FAKE DOCUMENT) Tj",
    "0 -28 Td",
    `/${"F1"} 12 Tf`,
    `(${safe}) Tj`,
    "0 -22 Td",
    "(Not a real client document. Demo file for local MVP only.) Tj",
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let offset = 9;
  const xref = ["0000000000 65535 f "];
  const chunks = ["%PDF-1.4\n"];
  for (const obj of objects) {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
    chunks.push(`${obj}\n`);
    offset += Buffer.byteLength(obj) + 1;
  }
  const xrefStart = offset;
  chunks.push(`xref\n0 ${objects.length + 1}\n${xref.join("\n")}\n`);
  chunks.push(
    `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );
  return Buffer.from(chunks.join(""), "utf8");
}
