'use client';

export function DownloadBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="download-bar">
      <div className="download-bar-inner">{children}</div>
    </div>
  );
}
