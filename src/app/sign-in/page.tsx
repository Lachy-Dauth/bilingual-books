import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <SignInForm googleEnabled={googleEnabled} />
    </main>
  );
}
