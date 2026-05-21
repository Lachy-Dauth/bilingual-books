'use client';

import type { Conversion } from '@prisma/client';
import { useT } from '@/i18n/I18nProvider';

export function ConversionTable({ rows }: { rows: Conversion[] }) {
  const { t } = useT();
  if (!rows.length) {
    return (
      <p className="text-[color:var(--muted)] py-6 text-center">{t('table.empty')}</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[color:var(--border)] text-[color:var(--muted)]">
            <th className="py-2 pr-2">{t('table.when')}</th>
            <th className="py-2 pr-2">{t('table.title')}</th>
            <th className="py-2 pr-2">{t('table.languages')}</th>
            <th className="py-2 pr-2 text-right">{t('table.words')}</th>
            <th className="py-2 pr-2">{t('table.source')}</th>
            <th className="py-2 pr-2">{t('table.status')}</th>
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
