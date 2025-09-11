import { EventCard } from '@/components/event-card';
import { getEvents } from '@/lib/data';
import { RegistrationsList } from './_components/registrations-list';
import { Suspense } from 'react';

export default function MyRegistrationsPage() {
  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">My Registrations</h1>
        <Suspense fallback={<p>Loading your registrations...</p>}>
            <RegistrationsList />
        </Suspense>
    </div>
  );
}
