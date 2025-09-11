
"use client";

import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage is only available on the client
    try {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            setRole(userRole);
            setIsAuthenticated(true);
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  return { isAuthenticated, role, isLoading };
}
