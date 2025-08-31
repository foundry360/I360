
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QuickActionProvider } from '@/contexts/quick-action-context';
import { NewCompanyDialog } from '@/components/new-company-dialog';
import { NewContactDialog } from '@/components/new-contact-dialog';
import { UserProvider, useUser } from '@/contexts/user-context';
import { AssessmentModal } from '@/components/assessment-modal';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { seedInitialData } from '@/services/seed-service';

const unprotectedRoutes = ['/login'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    seedInitialData().catch(console.error);
  }, []);

  React.useEffect(() => {
    if (loading || !isMounted) {
      return;
    }

    const pathIsUnprotected = unprotectedRoutes.includes(pathname);

    if (!user && !pathIsUnprotected) {
      router.push('/login');
    }

    if (user && pathIsUnprotected) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname, isMounted]);

  if (
    (loading || !isMounted || (!user && !unprotectedRoutes.includes(pathname))) &&
    pathname !== '/login'
  ) {
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Insights360</title>
        <meta name="description" content="AI-Powered RevOps & GTM Analysis" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <UserProvider>
          <QuickActionProvider>
            <AuthGuard>
                {children}
                <NewCompanyDialog />
                <NewContactDialog />
                <AssessmentModal 
                  // These props are managed by the QuickActionProvider now
                />
            </AuthGuard>
          </QuickActionProvider>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
