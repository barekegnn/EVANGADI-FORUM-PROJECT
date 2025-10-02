import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function FloatingActionButton() {
  return (
    <Button
      asChild
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90"
      size="icon"
    >
      <Link href="/questions/ask">
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add Question</span>
      </Link>
    </Button>
  );
}
