
import { Logo } from '@/components/logo';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-muted">
      <header className="flex h-16 items-center justify-between px-6 bg-background border-b">
        <Logo />
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
