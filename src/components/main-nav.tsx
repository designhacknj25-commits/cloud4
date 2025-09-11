
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Calendar,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Send,
  Loader2,
  HelpCircle,
  Users,
} from "lucide-react";

import { useUserRole } from "@/hooks/use-user-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BottomNav } from "./bottom-nav";
import { useSidebar } from "./ui/sidebar";
import { getUsers, type User } from "@/lib/data";


const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/registrations", label: "My Registrations", icon: BookOpen },
  { href: "/student/ask", label: "Ask Teacher", icon: Send },
  { href: "/student/faq", label: "FAQ", icon: HelpCircle },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
];

const teacherNav = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/events", label: "Manage Events", icon: Calendar },
  { href: "/teacher/inbox", label: "Inbox", icon: Bell },
  { href: "/teacher/faq", label: "Manage FAQs", icon: HelpCircle },
];

export function MainNav({ children }: { children: React.ReactNode }) {
  const role = useUserRole();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedRole || !storedEmail) {
      router.push('/login');
    } else {
      const users = getUsers();
      const currentUser = users.find(u => u.email === storedEmail);
      if (currentUser) {
        setUser(currentUser);
        setUnreadCount(currentUser.notifications.filter(n => !n.read).length);
      } else {
         router.push('/login');
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const navItems = role === "teacher" ? teacherNav : studentNav;

  if (!role || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block">
        <Sidebar>
          <SidebarHeader className="p-4 justify-between flex flex-row items-center">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden">
                MyCampusConnect
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: "right", align: "center" }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      {(item.href.includes('inbox') || item.href.includes('notifications')) && unreadCount > 0 && (
                        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
             {/* Can add breadcrumbs or page title here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photo || undefined} alt="User avatar" />
                  <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none capitalize">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                 <Link href={`/${role}/profile`}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                 </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
