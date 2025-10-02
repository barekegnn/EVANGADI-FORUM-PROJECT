"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const askQuestionSchema = z.object({
  title: z.string().min(1, "Title is required."),
  details: z.string().min(1, "Question details are required."),
  tags: z.string().min(1, "Please add at least one tag."),
});

type AskQuestionFormValues = z.infer<typeof askQuestionSchema>;

interface AskQuestionFormProps {
  onSubmit: (values: AskQuestionFormValues) => Promise<void>;
}

export function AskQuestionForm({ onSubmit }: AskQuestionFormProps) {
  const form = useForm<AskQuestionFormValues>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      title: "",
      details: "",
      tags: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., How to implement Dijkstra's algorithm in Python"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide all necessary details, context, and any code snippets if applicable."
                  rows={6}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (e.g., Programming, Python)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type to add tags or select from suggestions..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Preview Question
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Question
          </Button>
        </div>
      </form>
    </Form>
  );
}
