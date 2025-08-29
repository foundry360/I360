
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Skeleton } from './ui/skeleton';
import { handleGoogleRedirectResult } from '@/services/auth-service';


const unprotectedRoutes = ['/', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, reloadUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const handleRedirect = async () => {
      // This will only run once on mount, after the app has loaded
      // It checks if the user is returning from a Google redirect
      const userFromRedirect = await handleGoogleRedirectResult();
      if (userFromRedirect) {
          await reloadUser();
          router.push('/dashboard/profile'); // Navigate to a relevant page after sign-in
      }
    }
    
    if (isMounted) {
      handleRedirect();
    }
  }, [isMounted, reloadUser, router]);


  React.useEffect(() => {
    if (loading || !isMounted) {
      return; // Wait until user state is determined and component is mounted
    }

    const isUnprotected = unprotectedRoutes.some(route => pathname.startsWith(route));

    // If user is not logged in and trying to access a protected route, redirect to login
    if (!user && !isUnprotected) {
      router.push('/login');
    }

    // If user is logged in and on the login page, redirect to the dashboard
    if (user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname, isMounted]);

  // While loading or before mount, show a skeleton on protected routes
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
