"use client";

import { useState, useEffect, useCallback } from 'react';
import { EventCard } from '@/components/event-card';
import { getEvents, saveEvents, type Event } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function MyRegistrationsPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const allEvents = getEvents();
      const registered = allEvents.filter(event => event.participants.includes(userEmail));
      setMyEvents(registered);
    }
  }, []);

  const handleUnregister = useCallback((eventId: string) => {
    const userEmail = localStorage.getItem('userEmail');
    const allEvents = getEvents();
    const eventToUpdate = allEvents.find(e => e.id === eventId);

    if (eventToUpdate && userEmail) {
      const updatedEvent = { ...eventToUpdate, participants: eventToUpdate.participants.filter(p => p !== userEmail) };
      const updatedEvents = allEvents.map(e => e.id === eventId ? updatedEvent : e);
      
      saveEvents(updatedEvents);
      setMyEvents(prev => prev.filter(e => e.id !== eventId));
      
      toast({ title: "Successfully Unregistered" });
    } else {
      toast({ variant: "destructive", title: "Failed to Unregister" });
    }
  }, [toast]);

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">My Registrations</h1>
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
             <p className="text-muted-foreground">A list of events you are registered for will appear here.</p>
        )}
    </div>
  );
}
