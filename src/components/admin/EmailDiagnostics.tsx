'use client';

import { useEffect, useState } from 'react';

type ConfigStatus = {
  configured: boolean;
  host: string;
  port: number;
  user: string | null;
  from: string;
};

type VerifyStatus =
  | { ok: true }
  | { ok: false; reason: string; error?: string };

type TestResult =
  | { ok: true; to: string }
  | { ok: false; stage: string; error: string };

export function EmailDiagnostics({ defaultTo }: { defaultTo: string }) {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [verify, setVerify] = useState<VerifyStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [to, setTo] = useState(defaultTo);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/email-test', { method: 'GET' });
      const data = await res.json();
      setConfig(data.config);
      setVerify(data.verify);
    } catch (err) {
      setVerify({ ok: false, reason: 'fetch-failed', error: (err as Error).message });
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({ ok: true, to: data.to });
      } else {
        setResult({
          ok: false,
          stage: data.stage ?? 'unknown',
          error: data.error ?? 'Unknown error',
        });
      }
    } catch (err) {
      setResult({ ok: false, stage: 'fetch', error: (err as Error).message });
    } finally {
      setSending(false);
      void loadStatus();
    }
  }

  return (
    <div className="border border-[color:var(--border)] rounded-lg p-4 bg-[color:var(--surface)]">
      <h2 className="font-bold mb-3">SMTP diagnostics</h2>

      {loadingStatus ? (
        <p className="text-[color:var(--muted)] text-sm">Checking…</p>
      ) : config ? (
        <dl className="text-sm grid grid-cols-[110px_1fr] gap-y-1 mb-4">
          <dt className="text-[color:var(--muted)]">Configured</dt>
          <dd>
            {config.configured ? (
              <span className="text-green-700 font-semibold">Yes</span>
            ) : (
              <span className="text-red-700 font-semibold">No — SMTP_USER/SMTP_PASS missing</span>
            )}
          </dd>
          <dt className="text-[color:var(--muted)]">Host</dt>
          <dd>
            {config.host}:{config.port}
          </dd>
          <dt className="text-[color:var(--muted)]">User</dt>
          <dd>{config.user ?? '—'}</dd>
          <dt className="text-[color:var(--muted)]">From</dt>
          <dd className="break-all">{config.from}</dd>
          <dt className="text-[color:var(--muted)]">Auth check</dt>
          <dd>
            {verify?.ok ? (
              <span className="text-green-700 font-semibold">Connected & authenticated</span>
            ) : (
              <span className="text-red-700 font-semibold">
                Failed
                {!verify?.ok && 'error' in (verify ?? {}) && (
                  <>: {(verify as { error?: string }).error}</>
                )}
              </span>
            )}
          </dd>
        </dl>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="recipient@example.com"
        />
        <button
          type="button"
          onClick={sendTest}
          disabled={sending || !to.trim()}
          className="bg-[color:var(--accent)] text-white px-3 py-1.5 rounded font-semibold disabled:opacity-50 text-sm"
        >
          {sending ? 'Sending…' : 'Send test email'}
        </button>
      </div>

      {result && (
        <div
          className={
            'mt-3 text-sm rounded p-3 border ' +
            (result.ok
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900')
          }
        >
          {result.ok ? (
            <>Sent to <strong>{result.to}</strong>. Check the inbox (and spam).</>
          ) : (
            <>
              <strong>Failed at stage: {result.stage}</strong>
              <br />
              {result.error}
            </>
          )}
        </div>
      )}

      <p className="text-xs text-[color:var(--muted)] mt-3">
        Test sends a real email. Failures here are the same ones that would block /forgot-password.
      </p>
    </div>
  );
}
