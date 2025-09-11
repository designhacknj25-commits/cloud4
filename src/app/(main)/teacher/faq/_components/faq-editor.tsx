
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addFaq, updateFaq, deleteFaq, getFaqs, type FAQ } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { FaqItem } from "@/components/faq-item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
});

export function FaqEditor() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormPending, startFormTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFaqs(getFaqs());
    setIsLoading(false);
  }, []);

  const form = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: { id: "", question: "", answer: "" },
  });

  const handleOpenDialog = (faq: FAQ | null = null) => {
    setEditingFaq(faq);
    form.reset(faq || { id: "", question: "", answer: "" });
    setIsDialogOpen(true);
  };

  const handleDelete = (faqId: string) => {
    startFormTransition(() => {
      deleteFaq(faqId);
      setFaqs(prev => prev.filter(f => f.id !== faqId));
      toast({ title: "FAQ Deleted" });
    });
  };

  const onSubmit = (values: z.infer<typeof faqSchema>) => {
    startFormTransition(() => {
        if (editingFaq) {
            updateFaq(editingFaq.id, { question: values.question, answer: values.answer });
            setFaqs(getFaqs());
            toast({ title: "FAQ Updated" });
        } else {
            const { question, answer } = values;
            addFaq({ question, answer });
            setFaqs(getFaqs());
            toast({ title: "FAQ Added" });
        }
        setIsDialogOpen(false);
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
       <div className="flex justify-end mb-4">
            <Button onClick={() => handleOpenDialog()} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
            </Button>
        </div>
      <div className="space-y-4">
        {faqs.length > 0 ? (
          faqs.map(faq => (
            <FaqItem
              key={faq.id}
              faq={faq}
              onEdit={() => handleOpenDialog(faq)}
              onDelete={() => handleDelete(faq.id)}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-lg">
            <p className="text-muted-foreground">You haven't added any FAQs yet.</p>
          </div>
        )}
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add a New FAQ'}</DialogTitle>
                    <DialogDescription>
                        Fill in the question and answer below. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="question"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., When is the project due?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="answer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Answer</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide a clear and concise answer..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isFormPending}>
                               {isFormPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save FAQ
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
  );
}
