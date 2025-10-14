import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    // Split the token and decode the payload
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (parsedPayload.exp < currentTime) {
      // Token is expired, remove it from localStorage
      localStorage.removeItem("authToken");
      return false;
    }

    return true;
  } catch (error) {
    // If there's an error decoding the token, remove it
    localStorage.removeItem("authToken");
    return false;
  }
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

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (user.exp < currentTime) {
      // Token is expired, remove it from localStorage
      localStorage.removeItem("authToken");
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    // Remove invalid token
    localStorage.removeItem("authToken");
    return null;
  }
}
