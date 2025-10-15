"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
import { addQuestion } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";

export default function AskQuestionPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleQuestionSubmit = async (values: {
    title: string;
    details: string;
    tags: string;
  }) => {
    try {
      await addQuestion(values);
      toast({
        title: "Question Submitted!",
        description: "Your question has been posted successfully.",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to submit question:", error);
      toast({
        title: "Error",
        description: "Could not submit your question.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        {/* Back button section */}
        <div className="py-4 px-6 bg-background border-b">
          <div className="container mx-auto">
            <Link href="/dashboard" className="flex items-center gap-2 w-fit">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Questions</span>
            </Link>
          </div>
        </div>
        <main className="flex-1 p-4">
          <AskQuestionForm onSubmit={handleQuestionSubmit} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
