
'use client';

import * as React from 'react';
import { onAuthStateChangeObserver } from '@/services/auth-service';
import type { User } from 'firebase/auth';

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
    const unsubscribe = onAuthStateChangeObserver((user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const reloadUser = async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser(auth.currentUser);
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
