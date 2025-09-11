
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEvents, saveEvents, getUsers, type Event, type User } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ManageEventsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        const allEvents = getEvents();
        const allUsers = getUsers();
        setUsers(allUsers);
        setEvents(allEvents.filter(e => e.teacherEmail === userEmail));
    }, []);

    const deleteEvent = (eventId: string) => {
        const allEvents = getEvents();
        const updatedEvents = allEvents.filter(e => e.id !== eventId);
        saveEvents(updatedEvents);
        setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
        toast({ title: "Event Deleted" });
    };

    const editEvent = (eventId: string) => {
        localStorage.setItem('editEventId', eventId);
        router.push(`/teacher/events/edit`);
    };

    const getParticipantName = (email: string) => {
        const user = users.find(u => u.email === email);
        return user ? user.name : email;
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Manage Events</h1>
                    <p className="text-muted-foreground">Edit, delete, and view participants for your events.</p>
                </div>
                <Button asChild>
                    <Link href="/teacher/events/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                    </Link>
                </Button>
            </div>

            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {events.map(event => (
                        <Card key={event.id} className="bg-card/50 flex flex-col">
                            <CardHeader>
                                {event.poster && (
                                     <div className="relative h-48 w-full mb-4">
                                        <Image src={event.poster} alt={event.title} fill className="rounded-t-lg object-cover" data-ai-hint="event poster" />
                                    </div>
                                )}
                                <Badge variant="secondary" className="w-fit">{event.category}</Badge>
                                <CardTitle className="mt-2">{event.title}</CardTitle>
                                <CardDescription>{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 flex-grow">
                                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                                <p><strong>Deadline:</strong> {new Date(event.deadline).toLocaleString()}</p>
                                <p><strong>Limit:</strong> {event.limit === 0 ? 'Unlimited' : `${event.participants.length} / ${event.limit}`}</p>
                            </CardContent>
                             <CardFooter className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => editEvent(event.id)}>Edit</Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the event
                                        and remove all registration data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteEvent(event.id)}>
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="secondary">View Participants</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Participants for {event.title}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {event.participants.length > 0
                                                    ? 'Here is a list of all registered students.'
                                                    : 'There are no participants for this event yet.'}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        {event.participants.length > 0 && (
                                            <ScrollArea className="h-40 rounded-md border p-2">
                                                <div className="space-y-2">
                                                    {event.participants.map((p, i) => (
                                                        <div key={i} className="text-sm">{getParticipantName(p)}</div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Close</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-card/30 rounded-lg">
                    <p className="text-muted-foreground">You haven&apos;t created any events yet.</p>
                     <Button asChild className="mt-4">
                        <Link href="/teacher/events/create">Create Your First Event</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
