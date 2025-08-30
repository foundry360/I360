
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle } from '@/services/auth-service';
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
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
        await signInWithGoogle();
        // The page will redirect, so we don't need to set loading to false here.
    } catch (error) {
        console.error('Google sign-in failed:', error);
        toast({
            variant: 'destructive',
            title: 'Google Sign-in failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
        setGoogleLoading(false);
    }
  };

  // If the user is logged in or we are in the process of redirecting to Google, show a simple loading/redirecting message.
  // This prevents the login form from re-rendering and causing a loop during the redirect.
  if (user || googleLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Redirecting...</p>
            </div>
        </div>
    );
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
            Enter your credentials or sign in with Google.
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
              Sign In with Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2L337.5 152c-24.5-23.4-58.4-38-96.5-38-80.6 0-146.4 65.4-146.4 146s65.8 146 146.4 146c98.2 0 130.6-67.7 133.4-105.1H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign in with Google
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
