
"use client";

import { useState, useEffect, useMemo } from 'react';

export function useAuth() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on component mount.
    try {
        const userRole = localStorage.getItem('userRole');
        const userEmail = localStorage.getItem('userEmail');
        if (userRole && userEmail) {
            setRole(userRole);
            setEmail(userEmail);
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once.

  const isAuthenticated = useMemo(() => !!role && !!email, [role, email]);

  return { isAuthenticated, role, email, isLoading };
}
