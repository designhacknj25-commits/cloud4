
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const cookieStore = cookies();
  const userRole = cookieStore.get('userRole')?.value;

  if (userRole) {
    const redirectPath = userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
    redirect(redirectPath);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <div className="bg-card/50 backdrop-blur-lg border border-border rounded-2xl p-8 sm:p-12 shadow-2xl max-w-2xl text-foreground transition-all duration-500 hover:shadow-primary/20">
          
          <h1 className="text-4xl sm:text-6xl font-bold font-headline mb-4">
            Welcome to MyCampusConnect
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Your all-in-one platform for campus events, communication, and collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-semibold text-lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-semibold text-lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MyCampusConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
