
'use client';

import * as React from 'react';
import { onAuthStateChangeObserver } from '@/services/auth-service';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type UserContextType = {
  user: User | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChangeObserver((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const reloadUser = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        // After reloading, the onAuthStateChanged observer will trigger,
        // which will then update the user state. We can also set it here
        // to ensure the update is reflected as quickly as possible.
        setUser(auth.currentUser);
      } catch (error) {
        console.error("Error reloading user:", error);
      }
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, reloadUser }}>
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
