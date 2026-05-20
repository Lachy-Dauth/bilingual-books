'use client';

import { Coffee, Sun, Moon } from 'lucide-react';
import { useTheme, type Theme } from './ThemeProvider';

const OPTIONS: Array<{ value: Theme; label: string; Icon: React.ComponentType<{ size?: number }> }> = [
  { value: 'warm', label: 'Warm theme', Icon: Coffee },
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={`theme-toggle-btn ${theme === value ? 'active' : ''}`}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => setTheme(value)}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
