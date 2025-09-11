
"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUsers, saveUsers, type Notification, type User } from "@/lib/data";

const getMyNotifications = (teacherEmail: string): [Notification[], User | undefined] => {
    const users = getUsers();
    const teacher = users.find((u) => u.email === teacherEmail);
    return teacher ? [teacher.notifications, teacher] : [[], undefined];
};

export default function TeacherInboxPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [teacher, setTeacher] = useState<User | undefined>();
    
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
        
        const updatedNotifications = teacher.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        );
        
        const updatedTeacher = { ...teacher, notifications: updatedNotifications };
        setTeacher(updatedTeacher);
        setNotifications(updatedNotifications);
        
        const allUsers = getUsers();
        const userIndex = allUsers.findIndex(u => u.email === teacher.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = updatedTeacher;
            saveUsers(allUsers);
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
            <Card 
                key={notif.id} 
                className={`bg-card/50 cursor-pointer transition-all ${!notif.read ? 'border-primary/50' : ''}`}
                onClick={() => markAsRead(notif.id)}
            >
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
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">You have no notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
