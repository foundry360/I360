import { AppLayout } from '@/components/app-layout';

export default function CompanyDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
