
"use client";

import { useState, useEffect, useCallback } from 'react';
import { EventCard } from '@/components/event-card';
import { getEvents, updateEvent, type Event } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getCookie } from '@/lib/utils';

export function RegistrationsList() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const userEmail = getCookie('userEmail');

  const fetchMyEvents = useCallback(() => {
      if (userEmail) {
        setIsLoading(true);
        const allEvents = getEvents();
        const registered = allEvents.filter(event => event.participants.includes(userEmail));
        setMyEvents(registered);
        setIsLoading(false);
      }
    }, [userEmail]);


  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleUnregister = useCallback((eventId: string) => {
    if (!userEmail) return;

    const eventToUpdate = myEvents.find(e => e.id === eventId);

    if (eventToUpdate) {
      const updatedParticipants = eventToUpdate.participants.filter(p => p !== userEmail);
      updateEvent(eventId, { participants: updatedParticipants });
      setMyEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: "Successfully Unregistered" });
    } else {
      toast({ variant: "destructive", title: "Failed to Unregister" });
    }
  }, [userEmail, myEvents, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
        {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                     <EventCard
                        key={event.id}
                        event={event}
                        isRegistered={true}
                        onRegister={() => {}} // Should not be callable from this page
                        onUnregister={() => handleUnregister(event.id)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-card/30 rounded-lg">
               <p className="text-muted-foreground">You haven't registered for any events yet.</p>
            </div>
        )}
    </>
  );
}
