
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QuickActionProvider } from '@/contexts/quick-action-context';
import { NewCompanyDialog } from '@/components/new-company-dialog';
import { NewContactDialog } from '@/components/new-contact-dialog';
import { NewProjectDialog } from '@/components/new-project-dialog';
import { NewBacklogItemDialog } from '@/components/new-backlog-item-dialog';
import { NewEpicDialog } from '@/components/new-epic-dialog';
import { EditEpicDialog } from '@/components/edit-epic-dialog';
import { EditBacklogItemDialog } from '@/components/edit-backlog-item-dialog';
import { UserProvider, useUser } from '@/contexts/user-context';
import { AssessmentModal } from '@/components/assessment-modal';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

const unprotectedRoutes = ['/login', '/public/assessment/[companyId]', '/public/assessment/thanks'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (loading || !isMounted) {
      return;
    }

    const isPublicRoute = unprotectedRoutes.some(route => {
        if (route.includes('[companyId]')) {
            return new RegExp(`^${route.replace('[companyId]', '[^/]+')}$`).test(pathname);
        }
        return route === pathname;
    });

    if (!user && !isPublicRoute) {
      router.push('/login');
    }

    if (user && unprotectedRoutes.includes(pathname) && !pathname.startsWith('/public')) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname, isMounted]);

  if (loading && !unprotectedRoutes.some(route => new RegExp(`^${route.replace('[companyId]', '[^/]+')}$`).test(pathname))) {
    return (
        <div className="flex h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading...</p>
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <QuickActionProvider>
              <AuthGuard>
                  {children}
                  <NewCompanyDialog />
                  <NewContactDialog />
                  <NewProjectDialog />
                  <NewBacklogItemDialog />
                  <NewEpicDialog />
                  <EditEpicDialog />
                  <EditBacklogItemDialog />
                  <AssessmentModal 
                    // These props are managed by the QuickActionProvider now
                  />
              </AuthGuard>
            </QuickActionProvider>
          </UserProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
