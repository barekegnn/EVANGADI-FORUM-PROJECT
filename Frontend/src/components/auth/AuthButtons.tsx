"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AuthButtons() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  if (!isMounted) {
    return <div className="h-10 w-48 rounded-md bg-muted/30 animate-pulse" />;
  }

  if (isAuthenticated) {
    return (
      <div className="flex gap-2 items-center">
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <nav className="flex gap-2">
      <Button asChild variant="ghost">
        <Link href="/">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    </nav>
  );
}
