import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QuickActionProvider } from '@/contexts/quick-action-context';
import { NewCompanyDialog } from '@/components/new-company-dialog';

export const metadata: Metadata = {
  title: 'Insights360',
  description: 'AI-Powered RevOps & GTM Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased h-full" suppressHydrationWarning>
        <QuickActionProvider>
          {children}
          <NewCompanyDialog />
        </QuickActionProvider>
        <Toaster />
      </body>
    </html>
  );
}
