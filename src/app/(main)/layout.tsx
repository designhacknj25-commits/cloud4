import { MainNav } from "@/components/main-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/context/user-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
