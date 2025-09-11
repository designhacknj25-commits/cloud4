"use client";

import { useState, useEffect } from "react";
import { getFaqs, type FAQ } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, Loader2 } from "lucide-react";

export default function StudentFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
        setIsLoading(true);
        const data = await getFaqs();
        setFaqs(data);
        setIsLoading(false);
    }
    fetchFaqs();
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
            <p className="text-muted-foreground">Quick answers to common questions.</p>
        </div>
      </div>
      
      {faqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(faq => (
            <AccordionItem key={faq.id} value={faq.id} className="bg-card/50 px-4 rounded-lg mb-2">
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">No FAQs have been added yet.</p>
        </div>
      )}
    </div>
  );
}
