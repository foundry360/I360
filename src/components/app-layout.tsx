'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-sidebar p-4 md:p-6">
          <div className="h-full rounded-lg bg-background p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
