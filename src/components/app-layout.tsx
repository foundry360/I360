
'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 h-full bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
