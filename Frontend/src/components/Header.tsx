"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/utils";
import { getNotificationCount } from "@/lib/notifications";

// Create a context for notification count
const NotificationContext = createContext({
  notificationCount: 0,
  refreshNotificationCount: () => {},
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [authStatus, setAuthStatus] = useState(false);

  const fetchNotificationCount = async () => {
    try {
      if (isAuthenticated()) {
        const count = await getNotificationCount();
        setNotificationCount(count);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  };

  const refreshNotificationCount = () => {
    fetchNotificationCount();
  };

  useEffect(() => {
    const auth = isAuthenticated();
    setAuthStatus(auth);

    // Fetch notification count if user is authenticated
    if (auth) {
      fetchNotificationCount();
      // Set up interval to refresh notification count
      const interval = setInterval(fetchNotificationCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }

    // Listen for storage changes (in case another tab logs out)
    const handleStorageChange = () => {
      const newAuth = isAuthenticated();
      setAuthStatus(newAuth);
      if (newAuth) {
        fetchNotificationCount();
      } else {
        setNotificationCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case of token expiration
    const interval = setInterval(() => {
      const newAuth = isAuthenticated();
      setAuthStatus(newAuth);
      if (newAuth) {
        fetchNotificationCount();
      } else {
        setNotificationCount(0);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notificationCount, refreshNotificationCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);
  const { notificationCount } = useNotificationContext();
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );

  useEffect(() => {
    setIsMounted(true);
    const auth = isAuthenticated();
    setAuthStatus(auth);
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
              <Link href="/notifications" className="relative">
                <Bell className="h-6 w-6 text-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
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
