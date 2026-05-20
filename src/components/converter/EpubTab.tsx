'use client';

import { useRef, useState } from 'react';
import { isRtl, normalizeLanguageCode } from '@/lib/converter/constants';
import { parseEpub } from '@/lib/converter/epub-parse';
import { translateAll, type CancelSignal } from '@/lib/converter/translate';
import { buildEpub, saveBlobAs } from '@/lib/converter/epub-build';
import { countWords, slugify } from '@/lib/converter/util';
import type { ParsedEpub, TranslationItem } from '@/lib/converter/types';
import { logConversion, precheck } from '@/lib/client/api';

type Phase = 'idle' | 'parsed' | 'translating' | 'done' | 'cancelled';

export function EpubTab({
  gutenbergSeed,
}: {
  gutenbergSeed?: { bytes: ArrayBuffer; suggestedTitle: string; gutenbergId: number };
}) {
  const [parsed, setParsed] = useState<ParsedEpub | null>(null);
  const [sl, setSl] = useState('');
  const [tl, setTl] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [status, setStatus] = useState('Choose an EPUB file. Chapters and paragraphs will be detected automatically.');
  const [errorStatus, setErrorStatus] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [items, setItems] = useState<TranslationItem[]>([]);
  const cancelRef = useRef<CancelSignal>({ cancelled: false });
  const downloadRef = useRef<{ blob: Blob; filename: string } | null>(null);

  async function handleFile(buf: ArrayBuffer, fallbackTitle: string) {
    setStatus('Reading EPUB…');
    setErrorStatus(false);
    try {
      const p = await parseEpub(buf);
      const totalBlocks = p.chapters.reduce((s, c) => s + c.blocks.length, 0);
      setParsed(p);
      setStatus(`Loaded: ${p.chapters.length} chapters, ${totalBlocks} blocks.`);
      setPhase('parsed');
      if (!sl && p.language) setSl(normalizeLanguageCode(p.language));
      if (!titleOverride) setTitleOverride(p.title || fallbackTitle);
    } catch (err) {
      setParsed(null);
      setStatus(`Could not read EPUB: ${(err as Error).message}`);
      setErrorStatus(true);
      setPhase('idle');
    }
  }

  // Seed from Gutenberg tab
  if (gutenbergSeed && !parsed && phase === 'idle') {
    void handleFile(gutenbergSeed.bytes, gutenbergSeed.suggestedTitle);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    void handleFile(buf, file.name.replace(/\.epub$/i, ''));
  }

  async function onConvert() {
    if (!parsed) return;
    const sourceLang = sl.trim().toLowerCase();
    const targetLang = tl.trim().toLowerCase();
    if (!sourceLang || !targetLang) {
      alert('Please enter both source and target language codes.');
      return;
    }

    const all: TranslationItem[] = [];
    parsed.chapters.forEach((chapter, c) => {
      chapter.blocks.forEach((block, b) => {
        all.push({ chapterIdx: c, blockIdx: b, text: block.text, tag: block.tag });
      });
    });
    const plannedWords = all.reduce((s, it) => s + countWords(it.text), 0);

    setLimitMsg(null);
    const pre = await precheck(plannedWords);
    if (!pre.allowed) {
      setLimitMsg(
        pre.reason === 'monthly-word-limit-exceeded'
          ? `Monthly limit reached: ${pre.used}/${pre.limit} words on plan ${pre.plan}.`
          : `Conversion blocked: ${pre.reason ?? 'unknown'}`,
      );
      return;
    }
    if (pre.limit && pre.remaining !== null) {
      setLimitMsg(
        `${pre.used.toLocaleString()} of ${pre.limit.toLocaleString()} words used this month (${pre.plan} plan).`,
      );
    }

    cancelRef.current = { cancelled: false };
    setItems(all);
    setProgress({ done: 0, total: all.length });
    setPhase('translating');
    const start = Date.now();

    await translateAll(
      all,
      sourceLang,
      targetLang,
      ({ done, total, item }) => {
        setProgress({ done, total });
        parsed.chapters[item.chapterIdx].blocks[item.blockIdx].translation = item.translation;
      },
      cancelRef.current,
    );

    const cancelled = cancelRef.current.cancelled;
    setPhase(cancelled ? 'cancelled' : 'done');
    const elapsed = Date.now() - start;

    const blob = await buildEpub(parsed, sourceLang, targetLang, titleOverride);
    const slug =
      slugify(titleOverride || parsed.title || 'bilingual-book') || 'bilingual-book';
    downloadRef.current = { blob, filename: `${slug}-${sourceLang}-${targetLang}.epub` };

    void logConversion({
      bookTitle: titleOverride.trim() || parsed.title || 'Untitled',
      sourceLang,
      targetLang,
      wordCount: plannedWords,
      source: gutenbergSeed ? 'gutenberg' : 'epub',
      gutenbergId: gutenbergSeed?.gutenbergId,
      durationMs: elapsed,
      status: cancelled ? 'partial' : 'ok',
    });
  }

  function onCancel() {
    cancelRef.current.cancelled = true;
  }

  function onDownload() {
    if (downloadRef.current) saveBlobAs(downloadRef.current.blob, downloadRef.current.filename);
  }

  const totalBlocks = parsed?.chapters.reduce((s, c) => s + c.blocks.length, 0) ?? 0;

  return (
    <>
      {limitMsg && (
        <p className="field-hint" style={{ color: 'var(--accent)' }}>
          {limitMsg}
        </p>
      )}

      {!gutenbergSeed && (
        <>
          <label className="field-label" htmlFor="epub-file">
            EPUB file
          </label>
          <input
            id="epub-file"
            type="file"
            accept=".epub,application/epub+zip"
            onChange={onFileChange}
          />
        </>
      )}

      <p className={`epub-status ${errorStatus ? 'error' : ''}`}>{status}</p>

      {parsed && (
        <div className="epub-info">
          {[
            ['Title', parsed.title || '—'],
            ['Author', parsed.author || '—'],
            ['Detected language', parsed.language || '—'],
            ['Chapters', String(parsed.chapters.length)],
            ['Paragraphs / headings', String(totalBlocks)],
          ].map(([k, v]) => (
            <div className="info-row" key={k}>
              <span className="info-key">{k}</span>
              <span className="info-val">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="lang-row">
        <div>
          <label className="field-label" htmlFor="epub-sl">
            Source language
          </label>
          <textarea
            id="epub-sl"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            placeholder="e.g. en"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="epub-tl">
            Target language
          </label>
          <textarea
            id="epub-tl"
            value={tl}
            onChange={(e) => setTl(e.target.value)}
            placeholder="e.g. fr"
          />
        </div>
      </div>

      <label className="field-label" htmlFor="epub-title">
        Book title (override)
      </label>
      <textarea
        id="epub-title"
        className="book-title-input"
        value={titleOverride}
        onChange={(e) => setTitleOverride(e.target.value)}
        placeholder="Leave blank to keep the original title"
      />

      <div className="actions">
        <button
          type="button"
          className="cs-btn"
          onClick={onConvert}
          disabled={!parsed || phase === 'translating'}
        >
          Convert EPUB
        </button>
        {phase === 'translating' && (
          <button type="button" className="cs-btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        {(phase === 'done' || phase === 'cancelled') && downloadRef.current && (
          <button type="button" className="cs-btn" onClick={onDownload}>
            Download EPUB
          </button>
        )}
      </div>

      {phase === 'translating' && progress.total > 0 && (
        <div className="epub-progress" style={{ marginTop: 18 }}>
          <div className="progress-row">
            <span>Translating…</span>
            <span>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((progress.done / progress.total) * 100).toFixed(1)}%` }}
            />
          </div>
        </div>
      )}

      {items.length > 0 && parsed && (
        <div style={{ marginTop: 28 }}>
          {parsed.chapters.map((chapter, c) => (
            <div className="chapter" key={c}>
              <div className="chapter-title-display">{chapter.navTitle}</div>
              {chapter.blocks.map((block, b) => (
                <div
                  key={b}
                  className={`paragraph ${/^h[1-6]$/.test(block.tag) ? 'is-heading' : ''}`}
                >
                  <div className={`source ${isRtl(sl.toLowerCase()) ? 'rtl' : ''}`}>
                    {block.text}
                  </div>
                  <div className={`english ${isRtl(tl.toLowerCase()) ? 'rtl' : ''}`}>
                    {block.translation || (phase === 'translating' ? '…' : '')}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
