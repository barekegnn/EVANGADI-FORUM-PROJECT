"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Answer } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

interface AnswerCardProps {
  answer: Answer;
  onVote: (voteType: "up" | "down") => void;
  onAccept: () => void;
  isQuestionAuthor: boolean;
}

export function AnswerCard({
  answer,
  onVote,
  onAccept,
  isQuestionAuthor,
}: AnswerCardProps) {
  const timeAgo = formatDistanceToNow(new Date(answer.date), {
    addSuffix: true,
  });

  return (
    <Card className="bg-card">
      <CardHeader className="p-4 flex flex-row items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={answer.avatarUrl} alt={answer.author} />
          <AvatarFallback>{answer.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{answer.author}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            {isQuestionAuthor &&
              (answer.isAccepted ? (
                <Badge
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accepted
                </Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={onAccept}>
                  Accept Answer
                </Button>
              ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-foreground/90">{answer.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-start items-center">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onVote("up")}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{answer.votes}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onVote("down")}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
