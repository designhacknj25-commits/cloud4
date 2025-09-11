
"use client";

import { useState, useEffect } from 'react';
import { getCookie } from '@/lib/utils';

export function useAuth() {
  const [role, setRole] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = getCookie('userRole');
    const userEmail = getCookie('userEmail');
    setRole(userRole);
    setEmail(userEmail);
    setIsLoading(false);
  }, []);

  return { role, email, isLoading };
}
