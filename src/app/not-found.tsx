
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold mt-4">Page Not Found</p>
        <p className="text-muted-foreground mt-2">
          Sorry, the page you are looking for does not exist
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
