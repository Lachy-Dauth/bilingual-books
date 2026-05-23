'use client';

import Link from 'next/link';
import { useT } from '@/i18n/I18nProvider';
import { LocaleSwitcher } from '@/i18n/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function NavLinks({
  signedIn,
  isAdmin,
  userLabel,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  userLabel: string | null;
}) {
  const { t } = useT();
  return (
    <div className="nav-links">
      <Link href="/">{t('nav.convert')}</Link>
      {signedIn ? (
        <>
          <Link href="/dashboard">{t('nav.dashboard')}</Link>
          {isAdmin && <Link href="/admin">{t('nav.admin')}</Link>}
          {userLabel && (
            <span style={{ color: 'var(--muted)' }}>{userLabel}</span>
          )}
          <Link href="/sign-out">{t('nav.signOut')}</Link>
        </>
      ) : (
        <>
          <Link href="/sign-in">{t('nav.signIn')}</Link>
          <Link href="/sign-up">{t('nav.signUp')}</Link>
        </>
      )}
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
