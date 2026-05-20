'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/auth-client';

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    void signOut().then(() => {
      router.push('/');
      router.refresh();
    });
  }, [router]);
  return (
    <main className="max-w-md mx-auto py-12 px-4 text-center">
      <p>Signing out…</p>
    </main>
  );
}
