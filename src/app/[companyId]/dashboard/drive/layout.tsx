
import { AppLayout } from '@/components/app-layout';

export default function DriveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
