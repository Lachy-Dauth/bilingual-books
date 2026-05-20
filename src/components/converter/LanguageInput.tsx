'use client';

import { LANGUAGE_DATALIST_ID, LANGUAGES } from '@/lib/converter/languages';

export function LanguageDatalist() {
  return (
    <datalist id={LANGUAGE_DATALIST_ID}>
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </datalist>
  );
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
  return (
    <input
      id={id}
      type="text"
      list={LANGUAGE_DATALIST_ID}
      value={value}
      onChange={(e) => onChange(e.target.value.trim().toLowerCase())}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      autoCapitalize="none"
    />
  );
}
