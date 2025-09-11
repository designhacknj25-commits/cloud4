
"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getUsers, saveUsers, type User } from "@/lib/data";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(200, "Bio cannot exceed 200 characters.").optional(),
  photo: z.string().optional(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string>("");

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", bio: "", photo: "" },
  });

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      const currentUser = getUsers().find((u) => u.email === userEmail);
      if (currentUser) {
        setUser(currentUser);
        form.reset({
          name: currentUser.name,
          bio: currentUser.bio,
          photo: currentUser.photo,
        });
        setPreview(currentUser.photo);
      }
    }
  }, [form]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        form.setValue("photo", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    startTransition(() => {
      if (!user) {
        toast({ variant: "destructive", title: "Error", description: "User not found." });
        return;
      }
      
      const allUsers = getUsers();
      const userIndex = allUsers.findIndex(u => u.email === user.email);

      if (userIndex !== -1) {
        const updatedUser = { ...allUsers[userIndex], ...values };
        allUsers[userIndex] = updatedUser;
        saveUsers(allUsers);
        toast({ title: "Profile Updated", description: "Your information has been saved." });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not update profile." });
      }
    });
  };

  if (!user) {
    return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information and profile picture.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={preview} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <FormControl>
                    <>
                      <FormLabel
                        htmlFor="photo-upload"
                        className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 px-4 rounded-md flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </FormLabel>
                      <input
                        id="photo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little about yourself..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
