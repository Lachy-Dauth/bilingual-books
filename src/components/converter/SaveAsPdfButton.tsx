'use client';

import { useT } from '@/i18n/I18nProvider';

export function SaveAsPdfButton() {
  const { t } = useT();
  return (
    <button
      type="button"
      className="cs-btn btn-secondary"
      onClick={() => window.print()}
      title="Open your browser's print dialog. Pick 'Save as PDF' as the destination."
    >
      {t('common.saveAsPdf')}
    </button>
  );
}
