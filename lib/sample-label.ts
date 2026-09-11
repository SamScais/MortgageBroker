const SAMPLE_PREFIX = "SAMPLE Client — ";

export function labelSampleClient(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return `${SAMPLE_PREFIX}Unnamed`;
  if (/^SAMPLE\b/i.test(trimmed)) return trimmed;
  return `${SAMPLE_PREFIX}${trimmed}`;
}

export function isSampleLabel(value: string): boolean {
  return /^SAMPLE\b/i.test(value.trim());
}
