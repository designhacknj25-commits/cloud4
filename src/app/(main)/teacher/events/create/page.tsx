
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addEvent } from '@/lib/data';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/context/user-context';

const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  category: z.enum(['Workshop', 'Seminar', 'Social', 'Sports']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  limit: z.coerce.number().int().min(0, 'Limit cannot be negative.'),
});

export default function CreateEventPage() {
  const { user, refetchUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Workshop',
      date: '',
      deadline: '',
      limit: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof eventSchema>) => {
    startTransition(() => {
        try {
            if (!user || !user.email) throw new Error("User not found");

            const newEvent = {
                ...values,
                poster: `https://picsum.photos/seed/evt${Date.now()}/600/400`,
                teacherEmail: user.email,
                participants: [],
            };
            
            addEvent(newEvent);
            refetchUser();

            toast({
            title: 'Event Created!',
            description: `The event "${values.title}" has been successfully created.`,
            });
            router.push('/teacher/events');
        } catch (error: any) {
            console.error("Failed to create event:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to create the event. Please try again.',
            });
        }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/50">
      <CardHeader>
        <CardTitle>Create a New Event</CardTitle>
        <CardDescription>Fill out the details below to create a new campus event.</CardDescription>
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
            <Button type="submit" className="w-full" disabled={isPending || !user}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
