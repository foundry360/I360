'use client';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-sidebar">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <main className="h-full rounded-lg bg-background p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
