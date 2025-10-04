"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/utils";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );

  useEffect(() => {
    setIsMounted(true);
    const auth = isAuthenticated();
    setAuthStatus(auth);

    // Listen for storage changes (in case another tab logs out)
    const handleStorageChange = () => {
      const newAuth = isAuthenticated();
      setAuthStatus(newAuth);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case of token expiration
    const interval = setInterval(() => {
      const newAuth = isAuthenticated();
      setAuthStatus(newAuth);
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!isMounted) {
    return (
      <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 bg-muted rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={authStatus ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <h1 className="text-xl font-bold text-foreground font-headline">
            HU Connect
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          {authStatus ? (
            <>
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
            </>
          ) : (
            <nav className="flex gap-2">
              <Button asChild variant="ghost">
                <Link href="/">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
