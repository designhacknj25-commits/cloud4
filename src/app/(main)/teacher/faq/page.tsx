
"use client";

import { FaqEditor } from "./_components/faq-editor";

export default function ManageFaqsPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage FAQs</h1>
          <p className="text-muted-foreground">Create and edit FAQs for your students.</p>
        </div>
      </div>
      <FaqEditor />
    </div>
  );
}
