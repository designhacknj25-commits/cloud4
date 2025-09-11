
"use client";

import { useState, useTransition, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, saveUsers, getEvents, type User } from "@/lib/data";

// Helper function to add a notification to a teacher
const addNotificationForTeacher = (teacherEmail: string, studentEmail: string, question: string) => {
  let users: User[] = getUsers();
  const teacherIndex = users.findIndex((u) => u.email === teacherEmail);

  if (teacherIndex !== -1) {
    const newNotification = {
      id: `notif${Date.now()}`,
      from: studentEmail,
      message: question,
      date: new Date().toISOString(),
      read: false,
    };
    
    // Ensure notifications array exists
    if (!users[teacherIndex].notifications) {
      users[teacherIndex].notifications = [];
    }

    users[teacherIndex].notifications.unshift(newNotification);
    saveUsers(users);
    return true;
  }
  return false;
};

// Helper function to find the teacher of the most recent event the student registered for
const findMyTeacherEmail = (studentEmail: string) => {
    const events = getEvents();
    const myEvents = events.filter(e => e.participants.includes(studentEmail));
    
    if (myEvents.length > 0) {
        // Sort by date to find the most recent event
        myEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return myEvents[0].teacherEmail;
    }
    // Fallback to the default teacher if no events are found
    return "teacher@test.com";
}

const askSchema = z.object({
  question: z.string().min(10, "Please ask a more detailed question."),
});

export default function AskTeacherPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [studentEmail, setStudentEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setStudentEmail(email);
  }, []);


  const form = useForm<z.infer<typeof askSchema>>({
    resolver: zodResolver(askSchema),
    defaultValues: { question: "" },
  });

  function onSubmit(values: z.infer<typeof askSchema>) {
    startTransition(() => {
      try {
        if (!studentEmail) throw new Error("Student not logged in.");

        const teacherEmail = findMyTeacherEmail(studentEmail);

        if (teacherEmail) {
            const success = addNotificationForTeacher(teacherEmail, studentEmail, values.question);
            if (success) {
                toast({
                    title: "Question Sent!",
                    description: "Your teacher has been notified and will get back to you.",
                });
                form.reset();
            } else {
                 throw new Error("Could not find the teacher to notify.");
            }
        } else {
            // This case should not be reached with the fallback in findMyTeacherEmail, but it's good practice.
            throw new Error("Could not determine which teacher to send the question to.");
        }

      } catch (error: any) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Failed to Send",
          description: error.message || "Could not send your question. Please try again later.",
        });
      }
    });
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Send className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Ask a Question</CardTitle>
              <CardDescription>Your question will be sent to your most recent event's teacher, or the default instructor.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I have a question about the upcoming assignment...'"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending || !studentEmail}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Question
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
