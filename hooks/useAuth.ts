'use client';

import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return { logout };
}
