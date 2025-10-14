"use client";

import { useState, useEffect } from "react";
import type { Question, Answer } from "@/lib/data";
import { QuestionDetail } from "@/components/questions/QuestionDetail";
import { AnswerCard } from "@/components/questions/AnswerCard";
import { AnswerForm } from "@/components/questions/AnswerForm";
import { useToast } from "@/hooks/use-toast";
import {
  addAnswer,
  voteOnQuestion,
  voteOnAnswer,
  acceptAnswer,
  getQuestionById,
} from "@/lib/data";
import { isAuthenticated, getCurrentUser } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

interface QuestionPageClientComponentProps {
  question: Question;
  initialAnswers: Answer[];
  questionId: string;
}

export function QuestionPageClientComponent({
  question,
  initialAnswers,
  questionId,
}: QuestionPageClientComponentProps) {
  const [questionState, setQuestionState] = useState<Question>(question);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const { toast } = useToast();
  const router = useRouter();
  const currentUser = getCurrentUser();
  const { socket, connected } = useSocket();

  // Check if the current user is the author of the question
  const isQuestionAuthor =
    currentUser && currentUser.username === question.author;

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleAnswerCreated = (data: any) => {
      // Refresh the question data when a new answer is created
      refreshQuestionData();
    };

    const handleNotification = (data: any) => {
      // Refresh question data for any relevant notification
      if (data.entityId === questionId || data.type === "ANSWER_CREATED") {
        refreshQuestionData();
      }
    };

    socket.on("notification", handleNotification);
    // We can also listen for specific events if the backend emits them
    socket.on("answerCreated", handleAnswerCreated);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("answerCreated", handleAnswerCreated);
    };
  }, [socket, questionId]);

  const refreshQuestionData = async () => {
    try {
      const data = await getQuestionById(questionId);
      setQuestionState(data.question);
      setAnswers(data.answers);
    } catch (error) {
      console.error("Failed to refresh question data:", error);
    }
  };

  const handleAnswerSubmit = async (content: string) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit an answer.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    try {
      await addAnswer(questionId, content);
      toast({
        title: "Answer Submitted!",
        description: "Your answer has been posted successfully.",
      });
      // Refresh the question data to show the new answer
      await refreshQuestionData();
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast({
        title: "Error",
        description: "Could not submit your answer.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (
    type: "question" | "answer",
    itemId: string,
    voteType: "up" | "down"
  ) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    try {
      if (type === "question") {
        await voteOnQuestion(questionId, voteType);
      } else {
        await voteOnAnswer(questionId, itemId, voteType);
      }
      // Refresh the question data to show updated vote counts
      await refreshQuestionData();
    } catch (error: any) {
      console.error("Failed to vote:", error);
      const message = error.message || "Your vote could not be recorded.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to accept an answer.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    try {
      await acceptAnswer(questionId, answerId);
      toast({
        title: "Answer Accepted",
        description: "You've marked this answer as the solution.",
      });
      // Refresh the question data to show the accepted answer
      await refreshQuestionData();
    } catch (error) {
      console.error("Failed to accept answer:", error);
      toast({
        title: "Error",
        description: "Could not accept this answer.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <QuestionDetail
        question={questionState}
        onVote={(voteType) =>
          handleVote("question", questionState.id, voteType)
        }
      />

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Answers ({answers.length})</h2>
        <div className="space-y-4">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              onVote={(voteType) => handleVote("answer", answer.id, voteType)}
              onAccept={() => handleAcceptAnswer(answer.id)}
              isQuestionAuthor={isQuestionAuthor || false}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isQuestionAuthor ? (
          <Card className="p-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cannot Post Answer</AlertTitle>
              <AlertDescription>
                As the author of this question, you cannot post an answer to
                your own question.
              </AlertDescription>
            </Alert>
          </Card>
        ) : (
          <AnswerForm onSubmit={handleAnswerSubmit} />
        )}
      </div>
    </>
  );
}
