
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
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
    const { email, isAuthenticated } = useAuth();
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
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, isLoading, refetchUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};
