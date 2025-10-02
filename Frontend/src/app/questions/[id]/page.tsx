import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Question, Answer } from "@/lib/data";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { getQuestionById } from "@/lib/data";
import { QuestionPageClientComponent } from "@/app/questions/[id]/QuestionPageClientComponent";

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

  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );

  return (
    <div className="bg-background min-h-screen">
      <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground truncate">
              Question Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 text-foreground" />
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                {userImage && (
                  <AvatarImage src={userImage.imageUrl} alt="User avatar" />
                )}
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 pb-20">
        {/* Client Component handles interactive parts */}
        <QuestionPageClientComponent
          question={question}
          initialAnswers={answers}
          questionId={id}
        />
      </main>
    </div>
  );
}