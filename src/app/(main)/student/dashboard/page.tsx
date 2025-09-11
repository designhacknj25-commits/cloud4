import { getEvents, type Event } from '@/lib/data';
import { Suspense } from 'react';
import { StudentEventList } from './_components/student-event-list';
import { Loader2 } from 'lucide-react';

async function Events() {
  const events = await getEvents();
  return <StudentEventList initialEvents={events} />;
}

export default function StudentDashboard() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
      </div>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <Events />
      </Suspense>
    </div>
  );
}
