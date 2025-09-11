
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { addUser, getUserByEmail, type User } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(5, { message: "Password must be at least 5 characters." }),
  role: z.enum(["student", "teacher"]),
});

// Refine schema for signup page specifically
const signupSchema = formSchema.refine((data) => !!data.name && data.name.length > 0, {
  message: "Name is required.",
  path: ["name"],
});

export function AuthForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isLoginPage = pathname === "/login";
  // Get role from query params, default to 'student'
  const defaultRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(isLoginPage ? formSchema : signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: defaultRole,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (isLoginPage) {
        const user = await getUserByEmail(values.email);
        
        if (user && user.password === values.password) {
            if (user.role === values.role) {
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('userEmail', user.email);
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${user.name}!`,
                });
                const redirectPath = user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
                router.push(redirectPath);
            } else {
                 toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: `An account exists for this email as a '${user.role}'. Please select the correct role.`,
                });
            }
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid credentials.",
            });
        }
      } else { // Signup
        const existingUser = await getUserByEmail(values.email);
        if (existingUser) {
           toast({
                variant: "destructive",
                title: "Signup Failed",
                description: "Email already registered.",
            });
            return;
        }

        const newUser: Omit<User, 'id'> = { 
            name: values.name!, 
            email: values.email, 
            password: values.password, 
            role: values.role,
            photo: "",
            bio: "",
            notifications: [] 
        };

        await addUser(newUser);
        
        toast({
            title: "Signup Successful",
            description: "Please log in with your new account.",
        });
        router.push(`/login?role=${values.role}`);
      }
    } catch (error) {
       console.error("Authentication error:", error);
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-card/50 backdrop-blur-lg border border-border rounded-2xl p-8 shadow-2xl text-foreground transition-all duration-500">
      <div className="text-center mb-8">
        
        <h1 className="text-3xl font-bold font-headline">
          {isLoginPage ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="text-muted-foreground">
          {isLoginPage ? "Sign in to continue to MyCampusConnect" : "Join our campus community today!"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!isLoginPage && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="student" />
                        </FormControl>
                        <FormLabel className="font-normal">Student</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="teacher" />
                        </FormControl>
                        <FormLabel className="font-normal">Teacher</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoginPage ? "Login" : "Create Account"}
          </Button>
        </form>
      </Form>
      <div className="mt-6 text-center text-sm">
        {isLoginPage ? "Don't have an account? " : "Already have an account? "}
        <Link href={isLoginPage ? `/signup?role=${form.getValues('role')}` : `/login?role=${form.getValues('role')}`} className="font-medium text-primary hover:underline">
          {isLoginPage ? "Sign Up" : "Login"}
        </Link>
      </div>
    </div>
  );
}
