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

    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}
