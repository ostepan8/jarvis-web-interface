'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token && pathname !== '/login') {
      router.replace('/login');
    }
    if (token && pathname === '/login') {
      router.replace('/');
    }
  }, [token, pathname, router]);

  if (!token && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
