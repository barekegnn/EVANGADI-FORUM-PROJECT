"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowUp, Eye, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Question } from "@/lib/data";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  // Safely handle date formatting
  let timeAgo = "Unknown time";
  if (question.date) {
    try {
      // Handle different date formats that might come from the database
      const date = new Date(question.date);
      if (!isNaN(date.getTime())) {
        // Check if the date is valid (not in the future or too far in the past)
        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - date.getTime());
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        
        // If the date is within a reasonable range (not more than 10 years in the past or future)
        if (daysDifference < 365 * 10) {
          timeAgo = formatDistanceToNow(date, {
            addSuffix: true,
          });
        }
      }
    } catch (error) {
      console.warn("Error formatting date:", question.date, error);
    }
  }

  return (
    <Card className="w-full cursor-pointer hover:bg-card/90 transition-colors">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.avatarUrl} alt={question.author} />
            <AvatarFallback>{question.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{question.author}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h2 className="text-lg font-semibold leading-snug mb-3">
          {question.title}
        </h2>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4 text-primary" />
              <span>{question.votes} Votes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers.length} Answers</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{question.views} Views</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {question.tags && question.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}