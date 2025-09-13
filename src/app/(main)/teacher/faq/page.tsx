
"use client";

import { FaqEditor } from "./_components/faq-editor";
import { getEvents, getFaqs, type Event, type FAQ, type User } from "@/lib/data";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";


export default function ManageFaqsPage({ user }: { user: User }) {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myFaqs, setMyFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    setIsLoading(true);
    if (user && user.email) {
      const allEvents = getEvents().filter(e => e.teacherEmail === user.email);
      setMyEvents(allEvents);
      const myEventIds = allEvents.map(e => e.id);
      setMyFaqs(getFaqs().filter(f => myEventIds.includes(f.eventId)));
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage FAQs</h1>
          <p className="text-muted-foreground">Create and edit FAQs for your students.</p>
        </div>
      </div>
       {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <FaqEditor faqs={myFaqs} myEvents={myEvents} refreshData={refreshData} />
      )}
    </div>
  );
}
