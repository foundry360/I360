
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the default company dashboard
  redirect('/acme-inc/dashboard');
}

export const dynamic = "force-dynamic"
