'use client';

import clsx from 'clsx';
import { useT } from '@/i18n/I18nProvider';

export function BuyMeACoffee({
  className,
  labelKey,
}: {
  className?: string;
  /** Optional translation key override (e.g. 'common.thanksBmc'). */
  labelKey?: 'common.buyMeACoffee' | 'common.thanksBmc';
}) {
  const { t } = useT();
  const label = t(labelKey ?? 'common.buyMeACoffee');
  return (
    <a
      href="https://www.buymeacoffee.com/lachydauth"
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('bmc-link', className)}
    >
      <span aria-hidden="true">☕</span>
      <span>{label}</span>
    </a>
  );
}
