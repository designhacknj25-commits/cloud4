import { EventCard } from '@/components/event-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEvents, type Event } from '@/lib/data';
import { Suspense } from 'react';
import { StudentEventList } from './_components/student-event-list';

export default function StudentDashboard() {
  const categories = ['all', 'Workshop', 'Seminar', 'Social', 'Sports'];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Filtering controls can be moved to a client component if interactivity is complex */}
        </div>
      </div>
      <Suspense fallback={<div className="text-center">Loading events...</div>}>
        <StudentEventList />
      </Suspense>
    </div>
  );
}
