
'use client';

import * as React from 'react';
import { onAuthStateChangeObserver, handleGoogleRedirectResult } from '@/services/auth-service';
import type { User } from 'firebase/auth';

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isHandlingRedirect, setIsHandlingRedirect] = React.useState(true);

  React.useEffect(() => {
    // This effect runs once on mount to handle the redirect result.
    handleGoogleRedirectResult()
      .catch(console.error)
      .finally(() => setIsHandlingRedirect(false));
  }, []);

  React.useEffect(() => {
    // This effect sets up the auth state listener.
    // It will run after the redirect has been handled.
    if (isHandlingRedirect) return;

    const unsubscribe = onAuthStateChangeObserver((user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [isHandlingRedirect]);

  return (
    <UserContext.Provider value={{ user, loading: loading || isHandlingRedirect }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
