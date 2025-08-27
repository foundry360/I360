import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-sidebar px-6 text-sidebar-foreground">
      <Logo />
    </header>
  );
}
