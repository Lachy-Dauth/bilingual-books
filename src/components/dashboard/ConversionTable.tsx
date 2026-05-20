import type { Conversion } from '@prisma/client';

export function ConversionTable({ rows }: { rows: Conversion[] }) {
  if (!rows.length) {
    return (
      <p className="text-[color:var(--muted)] py-6 text-center">No conversions yet.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[color:var(--border)] text-[color:var(--muted)]">
            <th className="py-2 pr-2">When</th>
            <th className="py-2 pr-2">Title</th>
            <th className="py-2 pr-2">Languages</th>
            <th className="py-2 pr-2 text-right">Words</th>
            <th className="py-2 pr-2">Source</th>
            <th className="py-2 pr-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-[color:var(--border)]/50">
              <td className="py-2 pr-2 whitespace-nowrap">
                {new Date(c.createdAt).toLocaleString()}
              </td>
              <td className="py-2 pr-2">{c.bookTitle}</td>
              <td className="py-2 pr-2 whitespace-nowrap">
                {c.sourceLang} → {c.targetLang}
              </td>
              <td className="py-2 pr-2 text-right tabular-nums">
                {c.wordCount.toLocaleString()}
              </td>
              <td className="py-2 pr-2">{c.source}</td>
              <td className="py-2 pr-2">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
