
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Skeleton } from './ui/skeleton';

const unprotectedRoutes = ['/', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (loading) {
      return; // Wait until user state is determined
    }

    const isUnprotected = unprotectedRoutes.some(route => pathname.startsWith(route));

    // If user is not logged in and trying to access a protected route, redirect to login
    if (!user && !isUnprotected) {
      router.push('/login');
    }

    // If user is logged in and on the login page, redirect to the dashboard
    if (user && pathname === '/login') {
      router.push('/dashboard/companies');
    }
  }, [user, loading, router, pathname]);

  if ((loading || !isMounted) && !unprotectedRoutes.some(route => pathname.startsWith(route))) {
     return (
         <div className="flex h-screen w-screen items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                 <Skeleton className="h-16 w-16 rounded-full" />
                 <Skeleton className="h-8 w-48" />
                 <Skeleton className="h-6 w-32" />
             </div>
         </div>
     );
  }

  return <>{children}</>;
}
