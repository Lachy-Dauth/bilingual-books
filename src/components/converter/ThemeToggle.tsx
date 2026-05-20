'use client';

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="cs-btn btn-secondary"
      onClick={() => document.body.classList.toggle('bw')}
    >
      Toggle Theme
    </button>
  );
}
