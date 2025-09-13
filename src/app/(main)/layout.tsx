
"use client";

import { MainNav } from "@/components/main-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUserByEmail, type User } from "@/lib/data";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, email, isLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();

  const refetchUser = () => {
    if (email) {
      const currentUser = getUserByEmail(email);
      setUser(currentUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      refetchUser();
      setIsUserLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, isLoading]);


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

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { 
          user: user, 
          refetchUser: refetchUser 
        });
    }
    return child;
  });


  return (
    <SidebarProvider>
        <MainNav user={user} refetchUser={refetchUser} >
            {childrenWithProps}
        </MainNav>
    </SidebarProvider>
  );
}
