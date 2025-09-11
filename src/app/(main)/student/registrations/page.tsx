
"use client";

import { RegistrationsList } from './_components/registrations-list';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function MyRegistrationsPage() {
  return (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Registrations</h1>
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <RegistrationsList />
        </Suspense>
    </div>
  );
}
