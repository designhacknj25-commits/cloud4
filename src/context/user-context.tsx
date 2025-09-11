
"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getUserByEmail, type User } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';

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
    const { email, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (isAuthenticated && email) {
            setIsLoading(true);
            try {
                const currentUser = await getUserByEmail(email);
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        } else if (!isAuthenticated) {
             setUser(null);
             setIsLoading(false);
        }
    }, [email, isAuthenticated]);

    useEffect(() => {
        // Only fetch user if auth is resolved and the user is authenticated
        if (!isAuthLoading) {
          fetchUser();
        }
    }, [isAuthLoading, fetchUser]);

    const value = useMemo(() => ({ 
      user, 
      isLoading, 
      refetchUser: fetchUser 
    }), [user, isLoading, fetchUser]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
