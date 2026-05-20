'use client';

import { useEffect, useRef, useState } from 'react';
import { isRtl, normalizeLanguageCode } from '@/lib/converter/constants';
import { parseEpub } from '@/lib/converter/epub-parse';
import { translateAll, type CancelSignal } from '@/lib/converter/translate';
import { buildEpub, saveBlobAs } from '@/lib/converter/epub-build';
import { countWords, slugify } from '@/lib/converter/util';
import { expandParsed } from '@/lib/converter/expand';
import { sentenceAlignParsed } from '@/lib/converter/align';
import type { ParsedEpub, SplitMode, TranslationItem } from '@/lib/converter/types';
import { logConversion, precheck } from '@/lib/client/api';
import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import { DownloadBar } from './DownloadBar';

type Phase = 'idle' | 'parsed' | 'translating' | 'done' | 'cancelled';

export function EpubTab({
  gutenbergSeed,
}: {
  gutenbergSeed?: { bytes: ArrayBuffer; suggestedTitle: string; gutenbergId: number };
}) {
  const [rawParsed, setRawParsed] = useState<ParsedEpub | null>(null);
  const [parsed, setParsed] = useState<ParsedEpub | null>(null);
  const [mode, setMode] = useState<SplitMode>('paragraph');
  const [collapseBreaks, setCollapseBreaks] = useState(false);
  const [sl, setSl] = useState('');
  const [tl, setTl] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [status, setStatus] = useState(
    'Choose an EPUB file. Chapters and paragraphs will be detected automatically.',
  );
  const [errorStatus, setErrorStatus] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);
  const cancelRef = useRef<CancelSignal>({ cancelled: false });
  const downloadRef = useRef<{ blob: Blob; filename: string } | null>(null);

  async function handleFile(buf: ArrayBuffer, fallbackTitle: string) {
    setStatus('Reading EPUB…');
    setErrorStatus(false);
    try {
      const p = await parseEpub(buf);
      const totalBlocks = p.chapters.reduce((s, c) => s + c.blocks.length, 0);
      setRawParsed(p);
      setParsed(expandParsed(p, mode, collapseBreaks));
      setStatus(`Loaded: ${p.chapters.length} chapters, ${totalBlocks} blocks.`);
      setPhase('parsed');
      setHasOutput(false);
      downloadRef.current = null;
      setSl((cur) => cur || (p.language ? normalizeLanguageCode(p.language) : cur));
      setTitleOverride((cur) => cur || p.title || fallbackTitle);
    } catch (err) {
      setRawParsed(null);
      setParsed(null);
      setStatus(`Could not read EPUB: ${(err as Error).message}`);
      setErrorStatus(true);
      setPhase('idle');
    }
  }

  // Seed from Gutenberg tab — run once when seed bytes arrive
  useEffect(() => {
    if (!gutenbergSeed) return;
    void handleFile(gutenbergSeed.bytes, gutenbergSeed.suggestedTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gutenbergSeed]);

  // Re-expand whenever mode or line-break handling changes (only when nothing is in flight)
  useEffect(() => {
    if (!rawParsed) return;
    if (phase === 'translating') return;
    setParsed(expandParsed(rawParsed, mode, collapseBreaks));
    setHasOutput(false);
    downloadRef.current = null;
    setPhase(rawParsed ? 'parsed' : 'idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, collapseBreaks]);

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
    setProgress({ done: 0, total: all.length });
    setHasOutput(true);
    setPhase('translating');
    const start = Date.now();

    await translateAll(
      all,
      sourceLang,
      targetLang,
      ({ done, total, item }) => {
        setProgress({ done, total });
        parsed.chapters[item.chapterIdx].blocks[item.blockIdx].translation =
          item.translation;
      },
      cancelRef.current,
    );

    const cancelled = cancelRef.current.cancelled;
    const elapsed = Date.now() - start;

    let finalParsed = parsed;
    if (mode === 'sentence-aligned') {
      finalParsed = sentenceAlignParsed(parsed);
      setParsed(finalParsed);
    }

    setPhase(cancelled ? 'cancelled' : 'done');

    const blob = await buildEpub(finalParsed, sourceLang, targetLang, titleOverride);
    const slug =
      slugify(titleOverride || finalParsed.title || 'bilingual-book') ||
      'bilingual-book';
    downloadRef.current = { blob, filename: `${slug}-${sourceLang}-${targetLang}.epub` };

    void logConversion({
      bookTitle: titleOverride.trim() || finalParsed.title || 'Untitled',
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
  const downloadReady =
    (phase === 'done' || phase === 'cancelled') && downloadRef.current;

  return (
    <>
      {downloadReady && (
        <DownloadBar>
          <button type="button" className="cs-btn" onClick={onDownload}>
            Download EPUB
          </button>
          <BuyMeACoffee label="Liked it? Buy me a coffee" />
        </DownloadBar>
      )}

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
            [
              mode === 'sentence'
                ? 'Sentences / headings'
                : 'Paragraphs / headings',
              String(totalBlocks),
            ],
          ].map(([k, v]) => (
            <div className="info-row" key={k}>
              <span className="info-key">{k}</span>
              <span className="info-val">{v}</span>
            </div>
          ))}
        </div>
      )}

      <label className="field-label">Split translation by</label>
      <div className="segmented" role="tablist" aria-label="Split mode">
        <button
          type="button"
          className={mode === 'paragraph' ? 'active' : ''}
          onClick={() => setMode('paragraph')}
          disabled={phase === 'translating'}
          title="Translate paragraph by paragraph and display the same way."
        >
          Paragraph
        </button>
        <button
          type="button"
          className={mode === 'sentence' ? 'active' : ''}
          onClick={() => setMode('sentence')}
          disabled={phase === 'translating'}
          title="Split into sentences first, then translate each sentence on its own (less context for the translator)."
        >
          Sentence
        </button>
        <button
          type="button"
          className={mode === 'sentence-aligned' ? 'active' : ''}
          onClick={() => setMode('sentence-aligned')}
          disabled={phase === 'translating'}
          title="Translate paragraph by paragraph (full context), then split the result into aligned sentence pairs."
        >
          Sentence (aligned)
        </button>
      </div>

      <label className="field-label">Line breaks (&lt;br&gt;)</label>
      <div className="segmented" role="tablist" aria-label="Line break handling">
        <button
          type="button"
          className={!collapseBreaks ? 'active' : ''}
          onClick={() => setCollapseBreaks(false)}
          disabled={phase === 'translating'}
          title="Treat each <br>-separated line as its own translation pair."
        >
          Preserve
        </button>
        <button
          type="button"
          className={collapseBreaks ? 'active' : ''}
          onClick={() => setCollapseBreaks(true)}
          disabled={phase === 'translating'}
          title="Ignore <br> tags inside paragraphs; the whole paragraph is one chunk."
        >
          Collapse
        </button>
      </div>

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
              style={{
                width: `${((progress.done / progress.total) * 100).toFixed(1)}%`,
              }}
            />
          </div>
        </div>
      )}

      {hasOutput && parsed && (
        <div style={{ marginTop: 28 }}>
          {parsed.chapters.map((chapter, c) => (
            <div className="chapter" key={c}>
              <div className="chapter-title-display">{chapter.navTitle}</div>
              {chapter.blocks.map((block, b) => (
                <div
                  key={b}
                  className={[
                    'paragraph',
                    /^h[1-6]$/.test(block.tag) ? 'is-heading' : '',
                    block.paragraphEnd ? 'paragraph-end' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
