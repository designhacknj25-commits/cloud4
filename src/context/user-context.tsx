
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserByEmail, type User } from '@/lib/data';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  refetchUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { email, isLoading: isAuthLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const fetchUser = useCallback(() => {
    if (email) {
      const currentUser = getUserByEmail(email);
      setUser(currentUser);
    }
    setIsUserLoading(false);
  }, [email]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUser();
    }
  }, [isAuthLoading, fetchUser]);

  const contextValue = useMemo(() => ({
    user,
    isLoading: isAuthLoading || isUserLoading,
    refetchUser: fetchUser,
  }), [user, isAuthLoading, isUserLoading, fetchUser]);


  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
