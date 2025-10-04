import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("authToken");
  return !!token;
}

export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}
