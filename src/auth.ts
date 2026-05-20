import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db';
import { passwordResetHtml, sendEmail } from '@/lib/email';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // Sends via Resend when RESEND_API_KEY is configured; otherwise the
      // helper falls back to a console.warn so local dev / first-time setups
      // still surface the reset link.
      await sendEmail({
        to: user.email,
        subject: 'Reset your Bilingual Books password',
        html: passwordResetHtml(url),
      });
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: false,
        input: false,
      },
      tier: {
        type: 'string',
        defaultValue: 'free',
        required: false,
        input: false,
      },
      active: {
        type: 'boolean',
        defaultValue: true,
        required: false,
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: 'bb',
  },
});

export type Session = typeof auth.$Infer.Session;
