import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b border-border/50">
      <div className="container mx-auto">
        <Logo />
      </div>
    </header>
  );
}
