"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserByEmail, updateNotifications, type Notification, type User } from "@/lib/data";
import { Loader2 } from "lucide-react";

export default function NotificationsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            const email = localStorage.getItem("userEmail");
            if (email) {
                const currentUser = await getUserByEmail(email);
                setUser(currentUser);
            }
            setIsLoading(false);
        }
        fetchUser();
    }, []);

    const markAsRead = async (notificationId: string) => {
        if (!user || !user.id) return;
        
        const updatedNotifications = user.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        );
        
        await updateNotifications(user.id, updatedNotifications);
        setUser({ ...user, notifications: updatedNotifications });
    };

  if(isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Updates from your teachers will appear here.</p>
      </div>

      <div className="space-y-4">
        {user && user.notifications.length > 0 ? (
          user.notifications.map((notif) => (
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
