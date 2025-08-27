'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !username) {
      alert('Company ID and Username are required.');
      return;
    }
    
    try {
      // In a real app, you'd have authentication logic here.
      // For now, we'll just create/update the user document.
      const userDocRef = doc(db, 'companies', companyId, 'users', username);
      await setDoc(userDocRef, {
        username: username,
        lastLogin: serverTimestamp(),
      }, { merge: true });

      router.push(`/${companyId}/dashboard`);
    } catch (error) {
      console.error("Error saving user data:", error);
      alert('There was an error logging in. Please try again.');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company ID</Label>
                  <Input
                    id="companyId"
                    type="text"
                    placeholder="your-company-name"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="your-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
