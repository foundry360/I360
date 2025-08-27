'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Hardcoded Firebase config directly in the component
const firebaseConfig = {
  projectId: 'insights360-ta9hn',
  appId: '1:249056251135:web:016bba83b9d0d0150f50ca',
  storageBucket: 'insights360-ta9hn.firebasestorage.app',
  apiKey: 'AIzaSyC_Vd2Ttd3VwzefYCdTNLuO4Dk7KDESOE4',
  authDomain: 'insights360-ta9hn.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '249056251135',
};

// Initialize Firebase app and services within the component's scope
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (
      e.currentTarget.elements.namedItem('email') as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem('password') as HTMLInputElement
    ).value;

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Email and password are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/dashboard/workspaces`);
    } catch (error: any) {
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential'
      ) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          const displayName = email.split('@')[0];
          await updateProfile(user, { displayName });

          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });

          router.push(`/dashboard/workspaces`);
        } catch (creationError: any) {
          console.error('Error creating user:', creationError);
          toast({
            title: 'Signup Failed',
            description: creationError.message,
            variant: 'destructive',
          });
        }
      } else {
        console.error('Error signing in:', error);
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. john.doe@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Sign In or Sign Up
      </Button>
    </form>
  );
}
