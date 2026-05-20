'use client';

import type { GutendexBook } from '@/lib/gutenberg';

export function GutenbergResultsList({
  books,
  loadingId,
  onPick,
}: {
  books: GutendexBook[];
  loadingId: number | null;
  onPick: (book: GutendexBook) => void;
}) {
  if (books.length === 0) return null;
  return (
    <div className="gutenberg-results">
      {books.map((book) => {
        const cover = book.formats['image/jpeg'];
        const author = book.authors[0]?.name ?? 'Unknown';
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
                Languages: {book.languages.join(', ') || '—'} ·{' '}
                {book.download_count.toLocaleString()} downloads
              </p>
            </div>
            <button
              type="button"
              className="cs-btn"
              onClick={() => onPick(book)}
              disabled={loadingId !== null}
            >
              {loadingId === book.id ? 'Loading…' : 'Convert'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
