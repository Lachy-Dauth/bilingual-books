'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/auth-client';

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Invalid reset link</h1>
        <p className="text-sm text-[color:var(--muted)]">
          This URL is missing a reset token. Start over from{' '}
          <a href="/forgot-password" className="text-[color:var(--accent)] font-semibold">
            forgot password
          </a>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Password updated</h1>
        <p>
          You can now{' '}
          <a href="/sign-in" className="text-[color:var(--accent)] font-semibold">
            sign in
          </a>{' '}
          with your new password.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError(result.error.message ?? 'Could not reset password.');
      } else {
        setDone(true);
        setTimeout(() => router.push('/sign-in'), 2000);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold mb-4">Choose a new password</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <label className="block text-sm font-semibold mb-1">New password</label>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
        autoComplete="new-password"
      />

      <label className="block text-sm font-semibold mb-1">Confirm password</label>
      <input
        type="password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-[color:var(--accent)] text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {busy ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
