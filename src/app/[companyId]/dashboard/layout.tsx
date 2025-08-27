import { AppLayout } from '@/components/app-layout';

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
