"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/questions/QuestionCard";
import type { Question } from "@/lib/data";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { getQuestions } from "@/lib/data";

type SortType = "Newest First" | "Most Popular" | "Unanswered";

interface DashboardClientComponentProps {
  initialQuestions: Question[];
}

export function DashboardClientComponent({
  initialQuestions,
}: DashboardClientComponentProps) {
  const [activeSort, setActiveSort] = useState<SortType>("Newest First");
  const [allQuestions, setAllQuestions] =
    useState<Question[]>(initialQuestions);
  const [filteredQuestions, setFilteredQuestions] =
    useState<Question[]>(initialQuestions);
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, connected } = useSocket();

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      // Refresh questions when a new question is created or other relevant events
      if (data.type === "QUESTION_CREATED" || data.type === "ANSWER_CREATED") {
        refreshQuestions();
      }
    };

    const handleQuestionCreated = (data: any) => {
      // Refresh questions when a new question is created
      refreshQuestions();
    };

    socket.on("notification", handleNotification);
    socket.on("questionCreated", handleQuestionCreated);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("questionCreated", handleQuestionCreated);
    };
  }, [socket]);

  const refreshQuestions = async () => {
    try {
      const questions = await getQuestions();
      setAllQuestions(questions);
    } catch (error) {
      console.error("Failed to refresh questions:", error);
    }
  };

  useEffect(() => {
    setAllQuestions(initialQuestions);
    setFilteredQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    let sorted = [...allQuestions];

    if (activeSort === "Newest First") {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (activeSort === "Most Popular") {
      sorted.sort((a, b) => b.votes - a.votes);
    } else if (activeSort === "Unanswered") {
      sorted = sorted.filter((q) => q.answers.length === 0);
    }

    if (searchTerm) {
      sorted = sorted.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(sorted);
  }, [searchTerm, activeSort, allQuestions]);

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          className="pl-10 bg-card border-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Sort by:
        </span>
        <Button
          variant={activeSort === "Newest First" ? "default" : "secondary"}
          size="sm"
          className="rounded-full"
          onClick={() => setActiveSort("Newest First")}
        >
          Newest First
        </Button>
        <Button
          variant={activeSort === "Most Popular" ? "default" : "secondary"}
          size="sm"
          className="rounded-full"
          onClick={() => setActiveSort("Most Popular")}
        >
          Most Popular
        </Button>
        <Button
          variant={activeSort === "Unanswered" ? "default" : "secondary"}
          size="sm"
          className="rounded-full"
          onClick={() => setActiveSort("Unanswered")}
        >
          Unanswered
        </Button>
      </div>
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Link
            href={`/questions/${question.id}`}
            key={question.id}
            className="block"
          >
            <QuestionCard question={question} />
          </Link>
        ))}
      </div>
    </>
  );
}
