'use client';

import type { GutendexBook } from '@/lib/gutenberg';
import { useT } from '@/i18n/I18nProvider';

export function GutenbergResultsList({
  books,
  loadingId,
  onPick,
}: {
  books: GutendexBook[];
  loadingId: number | null;
  onPick: (book: GutendexBook) => void;
}) {
  const { t } = useT();
  if (books.length === 0) return null;
  return (
    <div className="gutenberg-results">
      {books.map((book) => {
        const cover = book.formats['image/jpeg'];
        const author = book.authors[0]?.name ?? t('gutenberg.unknownAuthor');
        return (
          <div className="gutenberg-card" key={book.id}>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="cover" src={cover} alt="" />
            ) : (
              <div className="cover" />
            )}
            <div className="meta">
              <p className="title">{book.title}</p>
              <p className="author">{author}</p>
              <p className="langs">
                {t('gutenberg.languagesList', {
                  langs: book.languages.join(', ') || '—',
                })}{' '}
                ·{' '}
                {t('gutenberg.downloads', {
                  count: book.download_count.toLocaleString(),
                })}
              </p>
            </div>
            <button
              type="button"
              className="cs-btn"
              onClick={() => onPick(book)}
              disabled={loadingId !== null}
            >
              {loadingId === book.id ? t('common.loading') : t('nav.convert')}
            </button>
          </div>
        );
      })}
    </div>
  );
}
