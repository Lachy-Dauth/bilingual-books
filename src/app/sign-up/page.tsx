import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <SignUpForm googleEnabled={googleEnabled} />
    </main>
  );
}
