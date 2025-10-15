"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/utils";
import LandingPage from "./LandingPage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return <LandingPage />;
}
