import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-sidebar px-4 md:px-6 w-full z-20 shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Logo />
      </div>
    </header>
  );
}
