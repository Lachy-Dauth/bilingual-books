'use client';

export function SaveAsPdfButton() {
  return (
    <button
      type="button"
      className="cs-btn btn-secondary"
      onClick={() => window.print()}
      title="Open your browser's print dialog. Pick 'Save as PDF' as the destination."
    >
      Save as PDF
    </button>
  );
}
