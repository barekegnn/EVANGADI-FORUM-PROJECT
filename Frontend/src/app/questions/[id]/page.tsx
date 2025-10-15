import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Question, Answer } from "@/lib/data";
import { getQuestionById } from "@/lib/data";
import { QuestionPageClientComponent } from "@/app/questions/[id]/QuestionPageClientComponent";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

// Server Component - fetches data on the server
export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params;
  let question: Question | null = null;
  let answers: Answer[] = [];

  try {
    const data = await getQuestionById(id);
    if (data) {
      question = data.question;
      answers = data.answers;
    }
  } catch (error: any) {
    console.error("Failed to fetch question details:", error);
    // If there's an error fetching the question, we'll show a 404
    // But first let's check if it's a 404 error specifically
    if (error.response && error.response.status === 404) {
      notFound();
    }
    // For other errors, we might want to show an error message instead
    // For now, we'll still show 404
    notFound();
  }

  if (!question) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <div className="bg-background min-h-screen">
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

        <main className="p-4 pb-20">
          {/* Client Component handles interactive parts */}
          <QuestionPageClientComponent
            question={question}
            initialAnswers={answers}
            questionId={id}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
