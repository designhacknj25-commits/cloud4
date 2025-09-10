"use client";

import { useState, useEffect } from 'react';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);
  }, []);

  return role;
}
