import { z } from 'zod';

export const conversionSourceSchema = z.enum(['paste', 'epub', 'gutenberg']);

export const logConversionSchema = z.object({
  bookTitle: z.string().min(1).max(500),
  sourceLang: z.string().min(2).max(10),
  targetLang: z.string().min(2).max(10),
  wordCount: z.number().int().min(0).max(10_000_000),
  source: conversionSourceSchema,
  gutenbergId: z.number().int().positive().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  status: z.enum(['ok', 'partial', 'cancelled', 'error']).default('ok'),
});

export const prechecksSchema = z.object({
  plannedWords: z.number().int().nonnegative().max(10_000_000),
});

export const gutenbergFetchSchema = z.object({
  gutenbergId: z.number().int().positive(),
  format: z.enum(['epub', 'txt']),
});

export const tierSchema = z.enum(['free', 'pro', 'unlimited']);
export const roleSchema = z.enum(['user', 'admin']);

export const adminUserPatchSchema = z.object({
  tier: tierSchema.optional(),
  role: roleSchema.optional(),
  active: z.boolean().optional(),
});
