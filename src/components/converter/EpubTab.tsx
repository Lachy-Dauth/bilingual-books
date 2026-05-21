'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isRtl, normalizeLanguageCode, SPEED_LEVELS } from '@/lib/converter/constants';
import { parseEpub } from '@/lib/converter/epub-parse';
import { translateAll, type CancelSignal } from '@/lib/converter/translate';
import { buildEpub, saveBlobAs } from '@/lib/converter/epub-build';
import { countWords, slugify } from '@/lib/converter/util';
import { expandParsed } from '@/lib/converter/expand';
import { sentenceAlignParsed } from '@/lib/converter/align';
import type {
  ParsedEpub,
  SpeedMode,
  SplitMode,
  TranslationItem,
} from '@/lib/converter/types';
import { logConversion, precheck } from '@/lib/client/api';
import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import { useT } from '@/i18n/I18nProvider';
import { DownloadBar } from './DownloadBar';
import { LanguageInput } from './LanguageInput';
import { HelpTip } from './HelpTip';
import { SaveAsPdfButton } from './SaveAsPdfButton';

type Phase = 'idle' | 'parsed' | 'translating' | 'done' | 'cancelled';

type StatusKind =
  | { type: 'default' }
  | { type: 'reading' }
  | { type: 'loaded'; chapters: number; blocks: number }
  | { type: 'error'; message: string };

export function EpubTab({
  gutenbergSeed,
}: {
  gutenbergSeed?: { bytes: ArrayBuffer; suggestedTitle: string; gutenbergId: number };
}) {
  const { t } = useT();
  const [rawParsed, setRawParsed] = useState<ParsedEpub | null>(null);
  const [parsed, setParsed] = useState<ParsedEpub | null>(null);
  const [mode, setMode] = useLocalStorage<SplitMode>('bb_split_mode', 'paragraph');
  const [collapseBreaks, setCollapseBreaks] = useLocalStorage('bb_collapse_breaks', true);
  const [speed, setSpeed] = useLocalStorage<SpeedMode>('bb_speed', 'normal');
  const [sl, setSl] = useState('');
  const [tl, setTl] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [status, setStatus] = useState<StatusKind>({ type: 'default' });
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [hasOutput, setHasOutput] = useState(false);
  const cancelRef = useRef<CancelSignal>({ cancelled: false });
  const [download, setDownload] = useState<{ blob: Blob; filename: string } | null>(
    null,
  );

  const statusText = useMemo(() => {
    switch (status.type) {
      case 'default':
        return t('epub.fileHint');
      case 'reading':
        return t('epub.reading');
      case 'loaded':
        return t('epub.loaded', {
          chapters: status.chapters,
          blocks: status.blocks,
        });
      case 'error':
        return t('epub.couldNotRead', { error: status.message });
    }
  }, [status, t]);

  async function handleFile(buf: ArrayBuffer, fallbackTitle: string) {
    setStatus({ type: 'reading' });
    try {
      const p = await parseEpub(buf);
      const totalBlocks = p.chapters.reduce((s, c) => s + c.blocks.length, 0);
      setRawParsed(p);
      setParsed(expandParsed(p, mode, collapseBreaks));
      setStatus({ type: 'loaded', chapters: p.chapters.length, blocks: totalBlocks });
      setPhase('parsed');
      setHasOutput(false);
      setDownload(null);
      setSl((cur) => cur || (p.language ? normalizeLanguageCode(p.language) : cur));
      setTitleOverride((cur) => cur || p.title || fallbackTitle);
    } catch (err) {
      setRawParsed(null);
      setParsed(null);
      setStatus({ type: 'error', message: (err as Error).message });
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
    setDownload(null);
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
          ? t('limit.exceeded', {
              used: pre.used,
              limit: pre.limit ?? 0,
              plan: pre.plan,
            })
          : t('limit.blocked', { reason: pre.reason ?? 'unknown' }),
      );
      return;
    }
    if (pre.limit && pre.remaining !== null) {
      setLimitMsg(
        t('limit.usage', {
          used: pre.used.toLocaleString(),
          limit: pre.limit.toLocaleString(),
          plan: pre.plan,
        }),
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
      SPEED_LEVELS[speed],
    );

    const cancelled = cancelRef.current.cancelled;
    const elapsed = Date.now() - start;

    let finalParsed = parsed;
    if (mode === 'sentence-aligned') {
      finalParsed = sentenceAlignParsed(parsed);
      setParsed(finalParsed);
    }

    const blob = await buildEpub(finalParsed, sourceLang, targetLang, titleOverride);
    const slug =
      slugify(titleOverride || finalParsed.title || 'bilingual-book') ||
      'bilingual-book';
    setDownload({ blob, filename: `${slug}-${sourceLang}-${targetLang}.epub` });
    setPhase(cancelled ? 'cancelled' : 'done');

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
    if (download) saveBlobAs(download.blob, download.filename);
  }

  const totalBlocks = parsed?.chapters.reduce((s, c) => s + c.blocks.length, 0) ?? 0;
  const downloadReady =
    (phase === 'done' || phase === 'cancelled') && download !== null;
  const isError = status.type === 'error';

  return (
    <>
      {downloadReady && (
        <DownloadBar>
          <button type="button" className="cs-btn" onClick={onDownload}>
            {t('common.download')}
          </button>
          <SaveAsPdfButton />
          <BuyMeACoffee labelKey="common.thanksBmc" />
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
            {t('epub.file')}
          </label>
          <input
            id="epub-file"
            type="file"
            accept=".epub,application/epub+zip"
            onChange={onFileChange}
          />
        </>
      )}

      <p className={`epub-status ${isError ? 'error' : ''}`}>{statusText}</p>

      {parsed && (
        <div className="epub-info">
          {[
            [t('epub.info.title'), parsed.title || '—'],
            [t('epub.info.author'), parsed.author || '—'],
            [t('epub.info.language'), parsed.language || '—'],
            [t('epub.info.chapters'), String(parsed.chapters.length)],
            [
              mode === 'sentence'
                ? t('epub.info.sentences')
                : t('epub.info.paragraphs'),
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

      <details className="advanced">
        <summary>{t('epub.advanced')}</summary>
        <div className="advanced-content">
          <label className="field-label">
            {t('split.label')}
            <HelpTip>
              <p>
                <strong>{t('split.paragraph')}</strong> &mdash; translate each
                paragraph as one block and display the same way. Fastest, fewest
                API calls.
              </p>
              <p>
                <strong>{t('split.sentence')}</strong> &mdash; split every
                paragraph into sentences first, then translate each sentence on
                its own. The translator has less context, so pronouns and
                references can drift, but every row is exactly one source
                sentence next to its translation.
              </p>
              <p>
                <strong>{t('split.sentenceAligned')}</strong> &mdash; translate
                each paragraph as a single chunk (full context), then split
                both the source and the translation back into sentences and
                pair them up proportionally. Best of both: paragraph-level
                translation quality with sentence-level visual alignment.
              </p>
            </HelpTip>
          </label>
          <div className="segmented" role="tablist" aria-label={t('split.label')}>
            <button
              type="button"
              className={mode === 'paragraph' ? 'active' : ''}
              onClick={() => setMode('paragraph')}
              disabled={phase === 'translating'}
            >
              {t('split.paragraph')}
            </button>
            <button
              type="button"
              className={mode === 'sentence' ? 'active' : ''}
              onClick={() => setMode('sentence')}
              disabled={phase === 'translating'}
            >
              {t('split.sentence')}
            </button>
            <button
              type="button"
              className={mode === 'sentence-aligned' ? 'active' : ''}
              onClick={() => setMode('sentence-aligned')}
              disabled={phase === 'translating'}
            >
              {t('split.sentenceAligned')}
            </button>
          </div>

          <label className="field-label">
            {t('speed.label')}
            <HelpTip>
              <p>
                <strong>{t('speed.slow')}</strong> &mdash; 2 simultaneous
                translations. Easiest on Google&rsquo;s free endpoint and never
                trips its rate limit, but takes the longest for big books.
              </p>
              <p>
                <strong>{t('speed.normal')}</strong> &mdash; 6 simultaneous
                translations. The balance that&rsquo;s worked well in practice;
                the occasional 429 is retried with backoff.
              </p>
              <p>
                <strong>{t('speed.fast')}</strong> &mdash; 12 simultaneous
                translations. Often faster, but Google may start returning 429
                (rate limit). The client automatically backs off and retries,
                so this can end up no faster than Normal &mdash; sometimes
                slower &mdash; on long books.
              </p>
            </HelpTip>
          </label>
          <div className="segmented" role="tablist" aria-label={t('speed.label')}>
            <button
              type="button"
              className={speed === 'slow' ? 'active' : ''}
              onClick={() => setSpeed('slow')}
              disabled={phase === 'translating'}
            >
              {t('speed.slow')}
            </button>
            <button
              type="button"
              className={speed === 'normal' ? 'active' : ''}
              onClick={() => setSpeed('normal')}
              disabled={phase === 'translating'}
            >
              {t('speed.normal')}
            </button>
            <button
              type="button"
              className={speed === 'fast' ? 'active' : ''}
              onClick={() => setSpeed('fast')}
              disabled={phase === 'translating'}
            >
              {t('speed.fast')}
            </button>
          </div>

          <label className="field-label">
            {t('breaks.label')}
            <HelpTip>
              <p>
                <strong>{t('breaks.preserve')}</strong> &mdash; treat each{' '}
                <code>&lt;br&gt;</code>-separated line as its own translation
                pair. Good for poetry, slogans, or any text where the line
                breaks carry meaning.
              </p>
              <p>
                <strong>{t('breaks.collapse')}</strong> &mdash; ignore{' '}
                <code>&lt;br&gt;</code> inside paragraphs; the whole paragraph
                becomes one chunk. Useful for EPUBs that use{' '}
                <code>&lt;br&gt;</code> for visual line-wrap inside what is
                logically one paragraph.
              </p>
            </HelpTip>
          </label>
          <div
            className="segmented"
            role="tablist"
            aria-label={t('breaks.label')}
          >
            <button
              type="button"
              className={!collapseBreaks ? 'active' : ''}
              onClick={() => setCollapseBreaks(false)}
              disabled={phase === 'translating'}
            >
              {t('breaks.preserve')}
            </button>
            <button
              type="button"
              className={collapseBreaks ? 'active' : ''}
              onClick={() => setCollapseBreaks(true)}
              disabled={phase === 'translating'}
            >
              {t('breaks.collapse')}
            </button>
          </div>
        </div>
      </details>

      <div className="lang-row">
        <div>
          <label className="field-label" htmlFor="epub-sl">
            {t('common.sourceLanguage')}
          </label>
          <LanguageInput
            id="epub-sl"
            value={sl}
            onChange={setSl}
            placeholder={t('epub.langPlaceholderEn')}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="epub-tl">
            {t('common.targetLanguage')}
          </label>
          <LanguageInput
            id="epub-tl"
            value={tl}
            onChange={setTl}
            placeholder={t('epub.langPlaceholderFr')}
          />
        </div>
      </div>

      <label className="field-label" htmlFor="epub-title">
        {t('epub.titleOverride')}
      </label>
      <textarea
        id="epub-title"
        className="book-title-input"
        value={titleOverride}
        onChange={(e) => setTitleOverride(e.target.value)}
        placeholder={t('epub.titleOverridePlaceholder')}
      />

      <div className="actions">
        <button
          type="button"
          className="cs-btn"
          onClick={onConvert}
          disabled={!parsed || phase === 'translating'}
        >
          {t('common.convertEpub')}
        </button>
        {phase === 'translating' && (
          <button type="button" className="cs-btn btn-secondary" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        )}
      </div>

      {phase === 'translating' && progress.total > 0 && (
        <div className="epub-progress" style={{ marginTop: 18 }}>
          <div className="progress-row">
            <span>{t('common.translating')}</span>
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
