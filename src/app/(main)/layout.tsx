
"use client";

import { MainNav } from "@/components/main-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { getUserByEmail, type User } from "@/lib/data";
import { UserContextProvider } from "@/context/user-context";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, email, isLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();

  const refetchUser = useCallback(() => {
    setIsUserLoading(true);
    if (email) {
      const currentUser = getUserByEmail(email);
      setUser(currentUser);
    } else {
      setUser(null);
    }
    setIsUserLoading(false);
  }, [email]);

  useEffect(() => {
    if (!isLoading) {
      refetchUser();
    }
  }, [email, isLoading, refetchUser]);


  useEffect(() => {
    if (!isLoading && !role) {
      router.replace('/login');
    }
  }, [role, isLoading, router]);

  if (isLoading || isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!role || !user) {
    // This can happen briefly during logout.
    // The useEffect above will redirect.
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <UserContextProvider value={{ user, refetchUser }}>
        <SidebarProvider>
            <MainNav>
                {children}
            </MainNav>
        </SidebarProvider>
    </UserContextProvider>
  );
}
