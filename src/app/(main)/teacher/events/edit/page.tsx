
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getEventById, updateEvent, type Event, User } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  category: z.enum(['Workshop', 'Seminar', 'Social', 'Sports']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  limit: z.coerce.number().int().min(0, 'Limit cannot be negative.'),
});

export default function EditEventPage({ refetchUser }: { refetchUser: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
  });

  const fetchEvent = useCallback(() => {
    const eventId = localStorage.getItem('editEventId');
    if (eventId) {
        const currentEvent = getEventById(eventId);
        if (currentEvent) {
            setEvent(currentEvent);
            const formattedDate = format(new Date(currentEvent.date), "yyyy-MM-dd'T'HH:mm");
            const formattedDeadline = format(new Date(currentEvent.deadline), "yyyy-MM-dd'T'HH:mm");

            form.reset({
            ...currentEvent,
            date: formattedDate,
            deadline: formattedDeadline,
            });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Event not found.' });
            router.push('/teacher/events');
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No event selected to edit.' });
        router.push('/teacher/events');
    }
    setIsLoading(false);
  },[form, router, toast]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const onSubmit = (values: z.infer<typeof eventSchema>) => {
    startTransition(() => {
        if (!event) return;
        try {
            updateEvent(event.id, values);
            refetchUser(); // refetch all data
            toast({
                title: 'Event Updated!',
                description: `The event "${values.title}" has been successfully updated.`,
            });
            localStorage.removeItem('editEventId'); // Clean up
            router.push('/teacher/events');
        } catch (error) {
            console.error("Failed to update event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update event.' });
        }
    });
  };

  if (isLoading || !event) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
        <CardDescription>Update the details for your event below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl><Input placeholder="e.g., 'Final Year Project Showcase'" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the event in detail..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Registration Deadline</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Limit (0 for unlimited)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
