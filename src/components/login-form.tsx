'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = (
      e.currentTarget.elements.namedItem('username') as HTMLInputElement
    ).value;
    if (!username) {
      alert('Username is required.');
      return;
    }

    try {
      // Simplify the write operation to its most basic form
      const userDocRef = doc(db, 'users', username);
      await setDoc(userDocRef, { username: username }, { merge: true });
      
      router.push(`/dashboard/workspaces`);
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('There was an error logging in. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="e.g. john.doe"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
