'use client';

import { useState, useTransition } from 'react';
import { deleteOwnAccount } from '@/app/dashboard/actions';
import { useT } from '@/i18n/I18nProvider';

export function DeleteAccountButton() {
  const { t } = useT();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-semibold text-red-700 underline-offset-2 hover:underline"
      >
        {t('delete.button')}
      </button>
    );
  }

  return (
    <div className="border border-red-300 bg-red-50 rounded p-4 text-sm">
      <p className="font-semibold mb-1">{t('delete.confirmTitle')}</p>
      <p className="text-[color:var(--muted)] mb-3">{t('delete.confirmBody')}</p>
      {err && (
        <p className="text-red-700 mb-2" role="alert">
          {err}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="px-3 py-1.5 border border-[color:var(--border)] rounded font-semibold"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={() =>
            start(async () => {
              try {
                await deleteOwnAccount();
              } catch (e) {
                setErr((e as Error).message);
              }
            })
          }
          disabled={pending}
          className="px-3 py-1.5 bg-red-600 text-white rounded font-semibold disabled:opacity-50"
        >
          {pending ? t('delete.deleting') : t('delete.confirmYes')}
        </button>
      </div>
    </div>
  );
}
