
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/services/auth-service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { Loader2 } from 'lucide-react';

const AnimatedLoader = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="relative h-24 w-24">
      <div className="absolute h-full w-full animate-spin-slow">
        <div className="absolute top-0 left-0 h-8 w-8 rounded-full bg-primary opacity-75"></div>
      </div>
      <div className="absolute h-full w-full animate-spin-medium">
        <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent opacity-75"></div>
      </div>
      <div className="absolute h-full w-full animate-spin-fast">
        <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-2 opacity-75"></div>
      </div>
       <div className="absolute h-full w-full animate-spin-slower">
        <div className="absolute bottom-0 left-0 h-8 w-8 rounded-md bg-chart-4 opacity-75"></div>
      </div>
       <div className="absolute h-full w-full animate-spin-medium-reverse">
        <div className="absolute top-0 right-0 h-8 w-8 rounded-md bg-chart-5 opacity-75"></div>
      </div>
    </div>
    <p className="mt-4 text-lg font-semibold text-foreground">Insights360 is launching...</p>
  </div>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign-in failed:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    } finally {
        setLoading(false);
    }
  };

  if (user) {
    return (
        <div className="flex h-screen items-center justify-center bg-background p-4">
            <AnimatedLoader />
        </div>
    );
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
