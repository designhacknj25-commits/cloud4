
"use client";

import { getFaqs, getEvents, type FAQ, type Event, User } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EventWithFaqs extends Event {
  faqs: FAQ[];
}

export default function StudentFaqPage() {
  const [eventsWithFaqs, setEventsWithFaqs] = useState<EventWithFaqs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allFaqs = getFaqs();
    const allEvents = getEvents();
    
    const eventsMap: { [key: string]: EventWithFaqs } = {};

    allEvents.forEach(event => {
      eventsMap[event.id] = { ...event, faqs: [] };
    });

    allFaqs.forEach(faq => {
      if (faq.eventId && eventsMap[faq.eventId]) {
        eventsMap[faq.eventId].faqs.push(faq);
      }
    });

    const filteredEventsWithFaqs = Object.values(eventsMap).filter(event => event.faqs.length > 0);

    setEventsWithFaqs(filteredEventsWithFaqs);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <HelpCircle className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">Find answers to questions about specific events.</p>
        </div>
      </div>
      
      {eventsWithFaqs.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {eventsWithFaqs.map(event => (
            <AccordionItem key={event.id} value={event.id} className="bg-card/50 px-4 rounded-lg">
              <AccordionTrigger className="text-left hover:no-underline text-lg font-semibold">
                {event.title}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="w-full">
                  {event.faqs.map(faq => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b-0">
                       <AccordionTrigger className="text-left hover:no-underline text-sm font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-2">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">No FAQs have been added for any events yet.</p>
        </div>
      )}
    </div>
  );
}
