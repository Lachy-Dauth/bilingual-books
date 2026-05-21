'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/auth-client';
import { useT } from '@/i18n/I18nProvider';

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const { t } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signUp.email({ email, password, name: name || email });
      if (result.error) {
        setError(result.error.message ?? t('auth.signUp.failed'));
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      await signIn.social({ provider: 'google', callbackURL: '/dashboard' });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <h1 className="text-2xl font-bold mb-4">{t('auth.signUp.title')}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <label className="block text-sm font-semibold mb-1">{t('auth.signUp.name')}</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <label className="block text-sm font-semibold mb-1">{t('common.email')}</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <label className="block text-sm font-semibold mb-1">{t('common.password')}</label>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[color:var(--accent)] text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {busy ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
      </button>

      {googleEnabled && (
        <>
          <div className="text-center text-sm text-[color:var(--muted)] my-3">
            {t('common.or')}
          </div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="w-full border border-[color:var(--border)] py-2 rounded font-semibold disabled:opacity-50"
          >
            {t('auth.signIn.continueGoogle')}
          </button>
        </>
      )}

      <p className="text-sm text-[color:var(--muted)] mt-4 text-center">
        {t('auth.signUp.haveAccount')}{' '}
        <a href="/sign-in" className="text-[color:var(--accent)] font-semibold">
          {t('auth.signIn.title')}
        </a>
      </p>
    </form>
  );
}
