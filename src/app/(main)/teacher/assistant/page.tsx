
"use client";

import { useState, useEffect, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { getUsers, saveUsers, type Notification, type User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Reply, Send } from "lucide-react";

// Helper function to add a notification to a specific user
const addNotificationForUser = (
  studentEmail: string,
  teacherEmail: string,
  message: string
) => {
  const users = getUsers();
  const studentIndex = users.findIndex((u) => u.email === studentEmail);

  if (studentIndex !== -1) {
    const newNotification = {
      id: `notif${Date.now()}`,
      from: teacherEmail,
      message: `Re: ${message}`, // Add a prefix to indicate it's a reply
      date: new Date().toISOString(),
      read: false,
    };
    users[studentIndex].notifications.unshift(newNotification);
    saveUsers(users);
    return true;
  }
  return false;
};

const getMyNotifications = (
  teacherEmail: string
): [Notification[], User | undefined] => {
  const users = getUsers();
  const teacher = users.find((u) => u.email === teacherEmail);
  return teacher ? [teacher.notifications, teacher] : [[], undefined];
};

const replySchema = z.object({
  replyMessage: z.string().min(5, "Reply must be at least 5 characters."),
});

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teacher, setTeacher] = useState<User | undefined>();
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyMessage: "" },
  });

  useEffect(() => {
    const teacherEmail = localStorage.getItem("userEmail");
    if (teacherEmail) {
      const [notifs, currentTeacher] = getMyNotifications(teacherEmail);
      setNotifications(notifs);
      setTeacher(currentTeacher);
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    if (!teacher) return;

    const updatedNotifications = teacher.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    const updatedTeacher = { ...teacher, notifications: updatedNotifications };
    setTeacher(updatedTeacher);
    setNotifications(updatedNotifications);

    const allUsers = getUsers();
    const userIndex = allUsers.findIndex((u) => u.email === teacher.email);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedTeacher;
      saveUsers(allUsers);
    }
  };

  const handleReplyClick = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDialogOpen(true);
    form.reset(); // Reset form when opening
  };

  const handleReplySubmit = (values: z.infer<typeof replySchema>) => {
    startTransition(() => {
      if (!teacher || !selectedNotif) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not send reply.",
        });
        return;
      }
      
      const success = addNotificationForUser(
        selectedNotif.from,
        teacher.email,
        values.replyMessage
      );

      if (success) {
        toast({
          title: "Reply Sent!",
          description: "Your reply has been sent to the student.",
        });
        setIsDialogOpen(false);
        // Optionally, mark the original message as read after replying
        markAsRead(selectedNotif.id);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send",
          description: "Could not find the student to send the reply to.",
        });
      }
    });
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">
          Questions from students will appear here.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`bg-card/50 transition-all ${
                !notif.read ? "border-primary/50" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4" onClick={() => markAsRead(notif.id)}>
                <Avatar>
                  <AvatarFallback>
                    {notif.from.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{notif.from}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      notif.read ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {notif.message}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto flex"
                    onClick={() => handleReplyClick(notif)}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">
              No questions yet. Your inbox is empty.
            </p>
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedNotif?.from}</DialogTitle>
            <DialogDescription>
                <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <span className="font-bold">Student's Question:</span> "{selectedNotif?.message}"
                </p>
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleReplySubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="replyMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Reply</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your response to the student here..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
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
