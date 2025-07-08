'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const showNavbar = !hideNavbarRoutes.includes(pathname);

  return (
    <AuthProvider>
      <AuthGuard>
        {showNavbar && <Navbar />}
        <main className={showNavbar ? 'pt-16' : ''}>
          {children}
        </main>
      </AuthGuard>
    </AuthProvider>
  );
}