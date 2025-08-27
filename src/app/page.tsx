import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6">
        <Logo />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Welcome to Insights360
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock powerful AI-driven insights for your RevOps and Go-To-Market strategies.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard/workspaces">
            Get Started
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </main>
      <footer className="text-center p-4 sm:p-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Insights360. All Rights Reserved.
      </footer>
    </div>
  );
}
