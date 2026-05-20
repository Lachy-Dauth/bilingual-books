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
    sendResetPassword: async ({ user, url }) => {
      // No mail provider is wired up. The reset link is logged so that during
      // local development / an admin running `railway logs` can grab it. To
      // turn this into a real password-reset flow, plug in Resend / Postmark /
      // SES here:
      //
      //   await resend.emails.send({
      //     from: 'noreply@bilingualbooks.app',
      //     to: user.email,
      //     subject: 'Reset your password',
      //     html: `<p>Reset your password: <a href="${url}">${url}</a></p>`,
      //   });
      console.log(
        `[auth] Password reset requested for ${user.email}. ` +
          `Reset URL (valid ~1h): ${url}`,
      );
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
