'use client';

import type { z } from 'zod';
import type { logConversionSchema } from '@/lib/validators';

export type LogConversionInput = z.input<typeof logConversionSchema>;

export type PrecheckResult = {
  allowed: boolean;
  remaining: number | null;
  used: number;
  limit: number | null;
  plan: string;
  reason?: string;
};

export async function precheck(plannedWords: number): Promise<PrecheckResult> {
  try {
    const res = await fetch('/api/conversions/precheck', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plannedWords }),
    });
    if (!res.ok) {
      return { allowed: true, remaining: null, used: 0, limit: null, plan: 'unknown' };
    }
    return (await res.json()) as PrecheckResult;
  } catch {
    return { allowed: true, remaining: null, used: 0, limit: null, plan: 'unknown' };
  }
}

export async function logConversion(input: LogConversionInput): Promise<void> {
  try {
    await fetch('/api/conversions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.warn('Failed to log conversion:', err);
  }
}
