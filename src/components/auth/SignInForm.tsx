'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/auth-client';

export function SignInForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? 'Sign in failed');
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
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <label className="block text-sm font-semibold mb-1">Email</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
      />

      <div className="flex items-baseline justify-between mb-1">
        <label className="block text-sm font-semibold">Password</label>
        <a
          href="/forgot-password"
          className="text-xs text-[color:var(--accent)] font-semibold"
        >
          Forgot?
        </a>
      </div>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[color:var(--accent)] text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>

      {googleEnabled && (
        <>
          <div className="text-center text-sm text-[color:var(--muted)] my-3">or</div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="w-full border border-[color:var(--border)] py-2 rounded font-semibold disabled:opacity-50"
          >
            Continue with Google
          </button>
        </>
      )}

      <p className="text-sm text-[color:var(--muted)] mt-4 text-center">
        New here?{' '}
        <a href="/sign-up" className="text-[color:var(--accent)] font-semibold">
          Create an account
        </a>
      </p>
    </form>
  );
}
