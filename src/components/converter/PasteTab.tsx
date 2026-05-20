'use client';

import { useRef, useState } from 'react';
import { isRtl } from '@/lib/converter/constants';
import { splitSentences } from '@/lib/converter/paste';
import { translateText, type CancelSignal } from '@/lib/converter/translate';
import { buildSimpleEpub, saveBlobAs } from '@/lib/converter/epub-build';
import { countWords } from '@/lib/converter/util';
import type { SentencePair } from '@/lib/converter/types';
import { logConversion, precheck } from '@/lib/client/api';
import { BuyMeACoffee } from '@/components/BuyMeACoffee';
import { DownloadBar } from './DownloadBar';
import { LanguageInput } from './LanguageInput';
import { SaveAsPdfButton } from './SaveAsPdfButton';

export function PasteTab() {
  const [sl, setSl] = useState('');
  const [tl, setTl] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [pairs, setPairs] = useState<SentencePair[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const cancelRef = useRef<CancelSignal>({ cancelled: false });

  async function onGenerate() {
    const sentences = splitSentences(sourceText);
    if (!sentences.length) return;
    const sourceLang = sl.trim().toLowerCase() || 'en';
    const targetLang = tl.trim().toLowerCase() || 'en';
    const plannedWords = sentences.reduce((s, t) => s + countWords(t), 0);

    setLimitMsg(null);
    const pre = await precheck(plannedWords);
    if (!pre.allowed) {
      setLimitMsg(
        pre.reason === 'monthly-word-limit-exceeded'
          ? `Monthly limit reached: ${pre.used}/${pre.limit} words on plan ${pre.plan}. Upgrade to convert more this month.`
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
    setCancelled(false);
    setBusy(true);
    setDone(false);
    const start = Date.now();
    const initial = sentences.map((src) => ({ src, tgt: '' }));
    setPairs(initial);

    let translated = 0;
    for (let i = 0; i < initial.length; i++) {
      if (cancelRef.current.cancelled) break;
      const translation = await translateText(
        initial[i].src,
        sourceLang,
        targetLang,
        cancelRef.current,
      );
      initial[i].tgt = translation;
      translated++;
      setPairs([...initial]);
    }
    const elapsed = Date.now() - start;
    const wasCancelled = cancelRef.current.cancelled;
    setBusy(false);
    setDone(true);
    setCancelled(wasCancelled);

    void logConversion({
      bookTitle: bookTitle.trim() || `Bilingual (${sourceLang} to ${targetLang})`,
      sourceLang,
      targetLang,
      wordCount: plannedWords,
      source: 'paste',
      durationMs: elapsed,
      status: wasCancelled ? 'partial' : 'ok',
    });
  }

  function onCancel() {
    cancelRef.current.cancelled = true;
  }

  async function onDownload() {
    if (!pairs.length) return;
    const sourceLang = sl.trim().toLowerCase() || 'en';
    const targetLang = tl.trim().toLowerCase() || 'en';
    const { blob, filename } = await buildSimpleEpub(
      pairs,
      sourceLang,
      targetLang,
      bookTitle,
    );
    saveBlobAs(blob, filename);
  }

  function onReset() {
    cancelRef.current.cancelled = true;
    setPairs([]);
    setDone(false);
    setSourceText('');
    setLimitMsg(null);
    setCancelled(false);
  }

  return (
    <>
      {done && (
        <DownloadBar>
          <button type="button" className="cs-btn" onClick={onDownload}>
            Download EPUB
          </button>
          <SaveAsPdfButton />
          <button type="button" className="cs-btn btn-secondary" onClick={onReset}>
            Start over
          </button>
          <BuyMeACoffee label="Liked it? Buy me a coffee" />
        </DownloadBar>
      )}

      {limitMsg && (
        <p className="field-hint" style={{ color: 'var(--accent)' }}>
          {limitMsg}
        </p>
      )}

      <div className="lang-row">
        <div>
          <label className="field-label" htmlFor="paste-sl">
            Source language
          </label>
          <LanguageInput id="paste-sl" value={sl} onChange={setSl} placeholder="e.g. fr" />
        </div>
        <div>
          <label className="field-label" htmlFor="paste-tl">
            Target language
          </label>
          <LanguageInput id="paste-tl" value={tl} onChange={setTl} placeholder="e.g. en" />
        </div>
      </div>

      <label className="field-label" htmlFor="paste-title">
        Book title
      </label>
      <textarea
        id="paste-title"
        className="book-title-input"
        value={bookTitle}
        onChange={(e) => setBookTitle(e.target.value)}
        placeholder="My Bilingual Book"
      />

      <label className="field-label" htmlFor="paste-source">
        Source text
      </label>
      <p className="field-hint">Text is split at full stops, one pair per sentence.</p>
      <textarea
        id="paste-source"
        className="source-text"
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        placeholder="Enter your source text here..."
      />

      <div className="actions">
        <button
          type="button"
          className="cs-btn"
          onClick={onGenerate}
          disabled={busy || !sourceText.trim()}
        >
          {busy ? 'Translating…' : 'Generate Book'}
        </button>
        {busy && (
          <button type="button" className="cs-btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      {cancelled && done && (
        <p className="field-hint" style={{ color: 'var(--accent)' }}>
          Cancelled. Showing partial translation.
        </p>
      )}

      {pairs.length > 0 && (
        <div style={{ marginTop: 28 }}>
          {pairs.map((pair, i) => (
            <div className="paragraph" key={i}>
              <div
                className={`source ${isRtl((sl || 'en').toLowerCase()) ? 'rtl' : ''}`}
              >
                {pair.src}
              </div>
              <div
                className={`english ${isRtl((tl || 'en').toLowerCase()) ? 'rtl' : ''}`}
              >
                {pair.tgt || (busy ? '…' : '')}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
