'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/login';
  return (
    <AuthProvider>
      <AuthGuard>
        {showNavbar && <Navbar />}
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
