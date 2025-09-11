"use client";

import { useState, useEffect, useContext } from 'react';
import { getEvents, type Event, type Notification } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarCheck, Users, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/context/user-context';

export default function TeacherDashboard() {
  const { user, isLoading: isUserLoading } = useContext(UserContext);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!user || !user.email) return;

        setIsStatsLoading(true);
        const allEvents = await getEvents();
        const myEvents = allEvents.filter(e => e.teacherEmail === user.email);
        const totalParticipants = myEvents.reduce((acc, curr) => acc + curr.participants.length, 0);
        
        setStats({
          totalEvents: myEvents.length,
          totalParticipants,
        });

        const recentNotifs = user.notifications.slice(0, 5);
        setRecentNotifications(recentNotifs);
        setIsStatsLoading(false);
    }
    fetchData();
  }, [user]);

  const isLoading = isUserLoading || isStatsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const unreadMessages = user ? user.notifications.filter(n => !n.read).length : 0;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Created</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total events you are managing.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across all your events.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">You have new messages in your inbox.</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50">
          <CardHeader>
              <CardTitle>Recent Student Questions</CardTitle>
              <CardDescription>The latest 5 messages from your inbox.</CardDescription>
          </CardHeader>
          <CardContent>
              {recentNotifications.length > 0 ? (
                  <div className="space-y-4">
                      {recentNotifications.map(notif => (
                          <div key={notif.id} className="flex items-center gap-4">
                              <Avatar className="h-9 w-9">
                                  <AvatarFallback>{notif.from.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="grid gap-1">
                                  <p className="text-sm font-medium leading-none">{notif.from}</p>
                                  <p className="text-sm text-muted-foreground truncate">{notif.message}</p>
                              </div>
                              <div className="ml-auto text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                              </div>
                          </div>
                      ))}
                      <Button asChild variant="outline" className="w-full mt-4">
                        <Link href="/teacher/inbox">View All Messages</Link>
                      </Button>
                  </div>
              ) : (
                  <div className="text-center py-8">
                      <p className="text-muted-foreground">No new messages from students.</p>
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
