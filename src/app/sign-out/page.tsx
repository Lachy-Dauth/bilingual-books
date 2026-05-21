'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/auth-client';
import { useT } from '@/i18n/I18nProvider';

export default function SignOutPage() {
  const router = useRouter();
  const { t } = useT();
  useEffect(() => {
    void signOut().then(() => {
      router.push('/');
      router.refresh();
    });
  }, [router]);
  return (
    <main className="max-w-md mx-auto py-12 px-4 text-center">
      <p>{t('auth.signOut.message')}</p>
    </main>
  );
}
