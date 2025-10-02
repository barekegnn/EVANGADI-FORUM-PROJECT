"use client";

import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AskQuestionForm } from "@/components/questions/AskQuestionForm";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { addQuestion } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AskQuestionPage() {
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );
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
    <div className="bg-background min-h-screen flex flex-col">
      <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">
              Ask a Question
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
      <main className="flex-1 p-4">
        <AskQuestionForm onSubmit={handleQuestionSubmit} />
      </main>
    </div>
  );
}
