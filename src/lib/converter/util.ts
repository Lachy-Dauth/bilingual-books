export function escapeXml(s: string | null | undefined): string {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c] as string,
  );
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i >= 0 ? path.slice(0, i + 1) : '';
}

export function joinPath(base: string, rel: string): string {
  if (!rel) return base;
  if (rel.startsWith('/')) return rel.replace(/^\/+/, '');
  const baseSegs = base.split('/').filter(Boolean);
  const relSegs = rel.split('/');
  for (const seg of relSegs) {
    if (seg === '..') baseSegs.pop();
    else if (seg !== '.' && seg !== '') baseSegs.push(seg);
  }
  return baseSegs.join('/');
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
