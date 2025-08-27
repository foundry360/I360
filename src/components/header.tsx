import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex w-full items-center justify-end">
        <Logo />
      </div>
    </header>
  );
}
