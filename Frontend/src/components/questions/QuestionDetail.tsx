"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Question } from "@/lib/data";

interface QuestionDetailProps {
  question: Question;
  onVote: (voteType: "up" | "down") => void;
}

export function QuestionDetail({ question, onVote }: QuestionDetailProps) {
  const timeAgo = formatDistanceToNow(new Date(question.date), {
    addSuffix: true,
  });

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={question.avatarUrl} alt={question.author} />
          <AvatarFallback>{question.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{question.author}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
      <p className="text-foreground/90 mb-6">{question.content}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {question.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="font-normal">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex justify-between items-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onVote("up")}
          >
            <ArrowUp className="h-5 w-5 text-primary" />
            <span>{question.votes}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onVote("down")}>
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4" />
          <span>{question.views} Views</span>
        </div>
      </div>
    </div>
  );
}
