
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type FAQ } from "@/lib/data";
import { Pencil, Trash2 } from "lucide-react";

interface FaqItemProps {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (faqId: string) => void;
}

export function FaqItem({ faq, onEdit, onDelete }: FaqItemProps) {
  return (
    <Card className="bg-card/50">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold pr-4">{faq.question}</CardTitle>
                  <CardDescription className="text-sm text-primary">{faq.eventTitle}</CardDescription>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(faq)} aria-label="Edit FAQ">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(faq.id)} aria-label="Delete FAQ">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{faq.answer}</p>
        </CardContent>
    </Card>
  );
}
