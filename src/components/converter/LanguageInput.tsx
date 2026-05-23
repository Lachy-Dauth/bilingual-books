'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, type Language } from '@/lib/converter/languages';

const MAX_RESULTS = 60;

function scoreMatch(l: Language, q: string): number {
  const code = l.code.toLowerCase();
  const name = l.name.toLowerCase();
  if (code === q) return 0;
  if (code.startsWith(q)) return 1;
  if (name.startsWith(q)) return 2;
  if (name.split(/\s+/).some((w) => w.startsWith(q))) return 3;
  if (name.includes(q)) return 4;
  if (code.includes(q)) return 5;
  return -1;
}

export function LanguageInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const q = value.trim().toLowerCase();

  const filtered = useMemo<Language[]>(() => {
    if (!q) return LANGUAGES;
    const scored: Array<{ l: Language; s: number }> = [];
    for (const l of LANGUAGES) {
      const s = scoreMatch(l, q);
      if (s >= 0) scored.push({ l, s });
    }
    scored.sort((a, b) => a.s - b.s || a.l.name.localeCompare(b.l.name));
    return scored.map((x) => x.l);
  }, [q]);

  useEffect(() => {
    setHi(0);
  }, [q]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = optionRefs.current[hi];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [hi, open]);

  function pick(lang: Language) {
    onChange(lang.code);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHi((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHi((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      if (open && filtered[hi]) {
        e.preventDefault();
        pick(filtered[hi]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  const visible = filtered.slice(0, MAX_RESULTS);
  const matched = LANGUAGES.find((l) => l.code.toLowerCase() === q);

  return (
    <div className="lang-combo" ref={wrapRef}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="none"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
      />
      {matched && !open && (
        <span className="lang-combo-pill" aria-hidden="true">
          {matched.name}
        </span>
      )}
      <span className="lang-combo-chevron" aria-hidden="true">
        ▾
      </span>
      {open && (
        <div
          className="lang-combo-list"
          id={`${id}-listbox`}
          role="listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {visible.length === 0 ? (
            <div className="lang-combo-empty">No language matches “{value}”</div>
          ) : (
            visible.map((l, i) => (
              <button
                type="button"
                key={l.code}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                className={`lang-combo-option ${i === hi ? 'highlight' : ''}`}
                onClick={() => pick(l)}
                onMouseEnter={() => setHi(i)}
                role="option"
                aria-selected={i === hi}
              >
                <span className="lang-combo-name">{l.name}</span>
                <span className="lang-combo-code">{l.code}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Kept as a named export so existing imports don't break, but it's no longer
// rendered — the LanguageInput above is fully self-contained.
export function LanguageDatalist() {
  return null;
}
