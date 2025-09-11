
"use client";

import { MainNav } from "@/components/main-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserProvider } from "@/context/user-context";
import { Loader2 } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.replace('/login');
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!role) {
    return null; 
  }

  return (
    <UserProvider>
        <SidebarProvider>
            <MainNav>
                {children}
            </MainNav>
        </SidebarProvider>
    </UserProvider>
  );
}
