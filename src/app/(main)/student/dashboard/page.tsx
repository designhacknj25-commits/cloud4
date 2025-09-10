"use client";

import { useState, useMemo, useTransition, useEffect } from 'react';
import { EventCard } from '@/components/event-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEvents, saveEvents, type Event } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function StudentDashboard() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const registeredEvents = useMemo(() => {
    const userEmail = localStorage.getItem('userEmail');
    return events.filter(e => e.participants.includes(userEmail || '')).map(e => e.id);
  }, [events]);
  
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = (event.title.toLowerCase() + " " + event.description.toLowerCase()).includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || event.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, category]);

  const handleRegister = (eventId: string) => {
    startTransition(() => {
      const allEvents = getEvents();
      const eventToUpdate = allEvents.find(e => e.id === eventId);
      const userEmail = localStorage.getItem('userEmail');

      if (eventToUpdate && userEmail && !eventToUpdate.participants.includes(userEmail)) {
        const updatedEvent = { ...eventToUpdate, participants: [...eventToUpdate.participants, userEmail] };
        const updatedEvents = allEvents.map(e => e.id === eventId ? updatedEvent : e);
        
        saveEvents(updatedEvents);
        setEvents(updatedEvents); // Update local state to re-render

        toast({ title: "Successfully Registered!", description: "You will be notified of any updates." });
      } else {
        toast({ variant: "destructive", title: "Registration Failed", description: "Already registered or error." });
      }
    });
  };

  const handleUnregister = (eventId: string) => {
    startTransition(() => {
      const allEvents = getEvents();
      const eventToUpdate = allEvents.find(e => e.id === eventId);
      const userEmail = localStorage.getItem('userEmail');

      if (eventToUpdate && userEmail) {
        const updatedEvent = { ...eventToUpdate, participants: eventToUpdate.participants.filter(p => p !== userEmail) };
        const updatedEvents = allEvents.map(e => e.id === eventId ? updatedEvent : e);
        
        saveEvents(updatedEvents);
        setEvents(updatedEvents); // Update local state to re-render
        
        toast({ title: "Successfully Unregistered" });
      } else {
        toast({ variant: "destructive", title: "Failed to Unregister", description: "Please try again." });
      }
    });
  };

  const categories = ['all', 'Workshop', 'Seminar', 'Social', 'Sports'];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search events..."
            className="w-full sm:w-64 bg-card/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending && (
          <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )}

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isRegistered={registeredEvents.includes(event.id)}
              onRegister={() => handleRegister(event.id)}
              onUnregister={() => handleUnregister(event.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/30 rounded-lg">
          <p className="text-muted-foreground">No events found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
