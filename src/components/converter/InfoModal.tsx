'use client';

import { BuyMeACoffee } from '@/components/BuyMeACoffee';

export function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="info-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="info-panel">
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Information</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close info"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <p>
          This tool generates a side-by-side bilingual edition of any text you give it.
          Pick the input that matches what you have.
        </p>
        <h2>Paste text</h2>
        <p>
          Drop any passage into the source box and the generator splits it at full stops,
          translates each sentence, and packages the pairs into a single-chapter EPUB. Best
          for short stories, articles, or anything you can copy out of a webpage or PDF.
        </p>
        <h2>Upload EPUB</h2>
        <p>
          Pick an existing <code>.epub</code> file and the generator parses its spine, walks
          every chapter&apos;s paragraphs and headings, translates each block, and assembles
          a new bilingual EPUB that preserves chapter boundaries and the cover image. Best
          for full books.
        </p>
        <h2>Search Project Gutenberg</h2>
        <p>
          Search the Project Gutenberg catalog for public-domain books, pick one, and the
          generator downloads the EPUB and converts it just like the upload flow.
        </p>
        <h2>Saving as EPUB</h2>
        <p>
          When generation finishes, a <em>Download EPUB</em> button appears at the top of
          the page. Click it to save the bilingual edition as a standard EPUB.
        </p>
        <h2>Saving as PDF</h2>
        <p>
          If you&apos;d rather have a PDF, once the bilingual book is on screen press{' '}
          <kbd>Ctrl + P</kbd> (Windows) or <kbd>Command + P</kbd> (Mac), choose{' '}
          <em>Save as PDF</em>, and set margins to 0 for the cleanest layout.
        </p>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <BuyMeACoffee />
        </div>
      </div>
    </div>
  );
}
