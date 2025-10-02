import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";

export default function Header() {
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );

  return (
    <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground font-headline">
            HU Connect
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Bell className="h-6 w-6 text-foreground" />
          </Link>
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
  );
}
