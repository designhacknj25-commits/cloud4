
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type User } from "@/lib/data";

interface UserContextType {
  user: User | null;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children, value }: { children: ReactNode; value: UserContextType }) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
