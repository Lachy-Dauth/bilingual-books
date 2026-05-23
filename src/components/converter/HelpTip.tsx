'use client';

export function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <span className="help-tip">
      <span
        className="help-tip-icon"
        tabIndex={0}
        role="button"
        aria-label="More information"
      >
        ?
      </span>
      <span className="help-tip-panel">{children}</span>
    </span>
  );
}
