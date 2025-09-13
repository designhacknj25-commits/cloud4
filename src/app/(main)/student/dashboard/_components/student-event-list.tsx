
"use client";

import { useState, useMemo, useTransition, useEffect } from 'react';
import { EventCard } from '@/components/event-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEvents, updateEvent, type Event, type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function StudentEventList({ user, refetchUser }: { user: User; refetchUser: () => void }) {
  const { toast } = useToast();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    setAllEvents(getEvents());
  };

  useEffect(() => {
    refreshData();
    setIsLoading(false);
  }, []);

  const registeredEventIds = useMemo(() => {
    if (!user || !user.email) return [];
    // We use `allEvents` from state here to ensure it's reactive
    const userEvents = allEvents.filter(e => e.participants.includes(user.email!));
    return userEvents.map(e => e.id);
  }, [user, allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = (event.title.toLowerCase() + " " + event.description.toLowerCase()).includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || event.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [allEvents, searchTerm, category]);

  const handleRegister = (eventId: string) => {
    startTransition(() => {
      const eventToUpdate = allEvents.find(e => e.id === eventId);
      
      if (eventToUpdate && user && user.email && !eventToUpdate.participants.includes(user.email)) {
        const updatedParticipants = [...eventToUpdate.participants, user.email];
        updateEvent(eventId, { participants: updatedParticipants });
        
        refetchUser(); // Re-fetches user data in layout
        refreshData(); // Re-fetches event data locally
        
        toast({ title: "Successfully Registered!", description: "You will be notified of any updates." });
      } else {
        toast({ variant: "destructive", title: "Registration Failed", description: "Already registered or error." });
      }
    });
  };

  const handleUnregister = (eventId: string) => {
    startTransition(() => {
      const eventToUpdate = allEvents.find(e => e.id === eventId);
      
      if (eventToUpdate && user && user.email) {
        const updatedParticipants = eventToUpdate.participants.filter(p => p !== user.email);
        updateEvent(eventId, { participants: updatedParticipants });

        refetchUser(); // Re-fetches user data in layout
        refreshData(); // Re-fetches event data locally

        toast({ title: "Successfully Unregistered" });
      } else {
        toast({ variant: "destructive", title: "Failed to Unregister", description: "Please try again." });
      }
    });
  };

  const categories = ['all', 'Workshop', 'Seminar', 'Social', 'Sports'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <>
      <div className="flex gap-2 w-full sm:w-auto justify-end mb-8">
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
              isRegistered={registeredEventIds.includes(event.id)}
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
    </>
  );
}
