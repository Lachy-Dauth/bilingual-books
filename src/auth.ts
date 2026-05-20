import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db';

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
    // Password reset is intentionally disabled in the UI for now. The
    // Gmail-API transport in src/lib/email.ts is fully wired and the
    // admin diagnostics panel still exercises it; to re-enable the
    // user flow, restore /forgot-password + /reset-password and add
    // the sendResetPassword callback back here:
    //
    //   sendResetPassword: async ({ user, url }) => {
    //     void sendEmail({
    //       to: user.email,
    //       subject: 'Reset your Bilingual Books password',
    //       html: passwordResetHtml(url),
    //     });
    //   },
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
