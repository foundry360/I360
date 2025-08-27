import { Logo } from './logo';

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground">
      <Logo />
    </header>
  );
}
