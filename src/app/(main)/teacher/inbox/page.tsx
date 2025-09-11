"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUsers, saveUsers, type Notification, type User } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Loader2, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const replySchema = z.object({
  replyMessage: z.string().min(1, "Reply message cannot be empty."),
});

export default function TeacherInboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teacher, setTeacher] = useState<User | undefined>();
  const [isReplyPending, startReplyTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyMessage: "" },
  });

  const loadNotifications = () => {
     const teacherEmail = localStorage.getItem("userEmail");
      if (teacherEmail) {
        const users = getUsers();
        const currentTeacher = users.find((u) => u.email === teacherEmail);
        if (currentTeacher) {
          setNotifications(currentTeacher.notifications);
          setTeacher(currentTeacher);
        }
      }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpenReplyDialog = (notification: Notification) => {
    setActiveNotification(notification);
    form.reset();
    setIsDialogOpen(true);
  };

  const sendReply = (values: z.infer<typeof replySchema>) => {
    startReplyTransition(() => {
        if (!teacher || !activeNotification) {
            toast({ variant: "destructive", title: "Error", description: "Could not send reply." });
            return;
        }

        const allUsers = getUsers();
        const studentIndex = allUsers.findIndex(u => u.email === activeNotification.from);

        if (studentIndex !== -1) {
            const newNotification: Notification = {
                id: `notif${Date.now()}`,
                from: teacher.email, // Reply is from the teacher
                message: values.replyMessage,
                date: new Date().toISOString(),
                read: false,
            };
            allUsers[studentIndex].notifications.unshift(newNotification);
            saveUsers(allUsers);
            toast({ title: "Reply Sent!", description: "The student has been notified." });
            setIsDialogOpen(false);
        } else {
            toast({ variant: "destructive", title: "Error", description: "Could not find the student to reply to." });
        }
    });
  }

  const markAsRead = (notificationId: string) => {
    if (!teacher) return;
    
    const allUsers = getUsers();
    const userIndex = allUsers.findIndex(u => u.email === teacher.email);

    if (userIndex !== -1) {
      const updatedNotifications = allUsers[userIndex].notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
      );
      allUsers[userIndex].notifications = updatedNotifications;
      saveUsers(allUsers);

      setNotifications(updatedNotifications);
      setTeacher(allUsers[userIndex]);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">Questions from your students will appear here.</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card key={notif.id} className={`bg-card/50 transition-all ${!notif.read ? 'border-primary/50' : ''}`} >
              <div onClick={() => markAsRead(notif.id)} className="cursor-pointer">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                  <Avatar>
                      <AvatarFallback>{notif.from.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-medium">{notif.from}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                        </p>
                    </div>
                    <p className={`mt-1 text-sm ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.message}</p>
                  </div>
                </CardHeader>
              </div>
              <CardFooter className="p-2 pt-0 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleOpenReplyDialog(notif)}>
                    <Reply className="mr-2 h-4 w-4" /> Reply
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">You have no notifications yet.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reply to {activeNotification?.from}</DialogTitle>
                    <DialogDescription>
                       Your message will be sent as a notification to the student.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(sendReply)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="replyMessage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Reply</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Type your reply..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isReplyPending}>
                               {isReplyPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reply
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
