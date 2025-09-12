
"use client";

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useContext, useEffect } from 'react';
import { TeacherEventList } from './_components/teacher-event-list';
import { UserContext } from '@/context/user-context';

export default function ManageEventsPage() {
    const { refetchUser } = useContext(UserContext);

    useEffect(() => {
        // Refetch data when this page is mounted to ensure it's fresh
        refetchUser();
    }, [refetchUser]);

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
            <Suspense fallback={<div className="text-center py-16">Loading events...</div>}>
                <TeacherEventList />
            </Suspense>
        </div>
    );
}
