import api from "./axios";

export interface Notification {
  id: string;
  type:
    | "comment"
    | "mention"
    | "reputation"
    | "answer"
    | "summary"
    | "follower";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return [];

    // Use the correct endpoint that exists in the backend
    const response = await api.get("/notifications/unread");
    return response.data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}