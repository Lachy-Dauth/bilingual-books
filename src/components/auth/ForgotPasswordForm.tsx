'use client';

import { useState } from 'react';
import { authClient } from '@/auth-client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : '/reset-password';
      const result = await authClient.requestPasswordReset({ email, redirectTo });
      if (result.error) {
        setError(result.error.message ?? 'Could not send reset link.');
      } else {
        setDone(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-3">Check your email</h1>
        <p>
          If <strong>{email}</strong> matches an account, we just sent a
          password-reset link to it. The link is valid for about an hour.
        </p>
        <p className="text-sm text-[color:var(--muted)] mt-3">
          Didn&apos;t get it? Check spam, or try{' '}
          <a href="/forgot-password" className="text-[color:var(--accent)] font-semibold">
            again
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold mb-1">Forgot your password?</h1>
      <p className="text-sm text-[color:var(--muted)] mb-4">
        Enter the email on your account. We&apos;ll send a reset link if it
        matches.
      </p>

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
        className="w-full border rounded px-3 py-2 mb-4"
        autoComplete="email"
      />

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[color:var(--accent)] text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-sm text-[color:var(--muted)] mt-4 text-center">
        <a href="/sign-in" className="text-[color:var(--accent)] font-semibold">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
