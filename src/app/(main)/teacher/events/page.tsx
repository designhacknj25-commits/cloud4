
"use client";

import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { TeacherEventList } from './_components/teacher-event-list';
import { getEvents, type Event } from '@/lib/data';
import { useUser } from '@/context/user-context';

export default function ManageEventsPage() {
    const { user, refetchUser } = useUser();
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = () => {
        setIsLoading(true);
        if (user && user.email) {
            const allEvents = getEvents();
            setMyEvents(allEvents.filter(e => e.teacherEmail === user.email));
        }
        setIsLoading(false);
        refetchUser();
    };

    useEffect(() => {
        setIsLoading(true);
        if (user && user.email) {
            const allEvents = getEvents();
            setMyEvents(allEvents.filter(e => e.teacherEmail === user.email));
        }
        setIsLoading(false);
    // We only want to run this when the user prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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
            <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <TeacherEventList events={myEvents} refreshData={refreshData} />
                )}
            </Suspense>
        </div>
    );
}
