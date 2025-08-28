
'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background rounded-tl-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
