"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUsers, saveUsers, type Notification, type User } from "@/lib/data";

const getMyNotifications = (studentEmail: string): [Notification[], User | undefined] => {
    const users = getUsers();
    const student = users.find((u) => u.email === studentEmail);
    return student ? [student.notifications, student] : [[], undefined];
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [student, setStudent] = useState<User | undefined>();
    
    useEffect(() => {
        const studentEmail = localStorage.getItem("userEmail");
        if (studentEmail) {
            const [notifs, currentStudent] = getMyNotifications(studentEmail);
            setNotifications(notifs);
            setStudent(currentStudent);
        }
    }, []);

    const markAsRead = (notificationId: string) => {
        if (!student) return;
        
        const updatedNotifications = student.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        );
        
        const updatedStudent = { ...student, notifications: updatedNotifications };
        setStudent(updatedStudent);
        setNotifications(updatedNotifications);
        
        const allUsers = getUsers();
        const userIndex = allUsers.findIndex(u => u.email === student.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = updatedStudent;
            saveUsers(allUsers);
        }
    };


  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Updates from your teachers will appear here.</p>
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
