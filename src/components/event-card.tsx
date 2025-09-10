"use client";

import Image from "next/image";
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Calendar, Clock, Users, Ticket } from "lucide-react";
import { type Event } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
}

export function EventCard({ event, isRegistered, onRegister, onUnregister }: EventCardProps) {
  const { toast } = useToast();
  const seatsLeft = event.limit > 0 ? event.limit - event.participants.length : Infinity;
  const deadlinePassed = isPast(new Date(event.deadline));
  const isFull = seatsLeft <= 0;

  const handleRegister = () => {
    if (deadlinePassed) {
      toast({ variant: "destructive", title: "Registration has closed." });
      return;
    }
    if (isFull) {
      toast({ variant: "destructive", title: "This event is full." });
      return;
    }
    onRegister(event.id);
  };

  const handleUnregister = () => {
     if (deadlinePassed) {
      toast({ variant: "destructive", title: "The deadline to unregister has passed." });
      return;
    }
    onUnregister(event.id);
  };

  return (
    <Card className="flex flex-col overflow-hidden bg-card/50 backdrop-blur-lg border border-border shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={event.poster}
            alt={event.title}
            fill
            className="object-cover"
            data-ai-hint="event poster"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6 pb-2">
          <Badge variant="secondary" className="mb-2">{event.category}</Badge>
          <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
          <CardDescription className="mt-2 h-12 line-clamp-2">{event.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-2">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(new Date(event.date), 'MMMM d, yyyy')} at {format(new Date(event.date), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Registration closes {formatDistanceToNow(new Date(event.deadline), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
             <span>
                {event.limit === 0
                  ? 'Unlimited seats'
                  : isFull
                  ? 'Event is full'
                  : `${seatsLeft} of ${event.limit} seats available`}
              </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        {isRegistered ? (
          <Button variant="destructive" className="w-full" onClick={handleUnregister} disabled={deadlinePassed}>
            <Ticket className="mr-2 h-4 w-4" />
            Unregister
          </Button>
        ) : (
          <Button className="w-full" onClick={handleRegister} disabled={deadlinePassed || isFull}>
             <Ticket className="mr-2 h-4 w-4" />
             Register
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
