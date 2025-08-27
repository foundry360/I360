import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, BarChart, Settings, BotMessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive tooltip="Dashboard">
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Analytics">
                <BarChart />
                Analytics
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="AI Tools">
                <BotMessageSquare />
                AI Tools
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Settings">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <ScrollArea className="h-full">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </ScrollArea>
      </SidebarInset>
    </>
  );
}