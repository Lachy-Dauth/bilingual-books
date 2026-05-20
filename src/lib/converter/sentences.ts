/**
 * Split a single line of text into sentences. Handles Latin-script
 * (.!?), CJK (。！？), and Arabic (؟) sentence terminators. Does not
 * cross newline boundaries — the caller is expected to split on \n first.
 */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(/(?<=[.!?。！？؟])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [trimmed];
}
