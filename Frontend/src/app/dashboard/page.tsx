import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/questions/QuestionCard";
import type { Question } from "@/lib/data";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/questions/FloatingActionButton";
import { getQuestions } from "@/lib/data";
import Link from "next/link";
import { DashboardClientComponent } from "@/app/dashboard/DashboardClientComponent";

type SortType = "Newest First" | "Most Popular" | "Unanswered";

// Server Component - fetches data on the server
export default async function DashboardPage() {
  let allQuestions: Question[] = [];

  try {
    allQuestions = await getQuestions();
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    // Handle error appropriately - maybe show an error message to the user
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-grow p-4 pb-20">
        {/* Client Component handles search and sorting */}
        <DashboardClientComponent initialQuestions={allQuestions} />
      </div>
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
