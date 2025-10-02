"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";

interface AnswerFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function AnswerForm({ onSubmit }: AnswerFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      startTransition(async () => {
        await onSubmit(content);
        setContent("");
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full gap-2">
            <Textarea
              placeholder="Share your insights and help others..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !content.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Answer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
