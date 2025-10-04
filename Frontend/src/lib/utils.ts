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

// Function to decode JWT token and get user information
export function getCurrentUser(): { id: string; username: string } | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    // Split the token and decode the payload
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    const user = JSON.parse(decodedPayload);

    return {
      id: user.id,
      username: user.username,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
