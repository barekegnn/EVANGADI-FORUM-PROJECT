import api from "./axios";
import { formatDistanceToNow } from "date-fns";

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
    const backendNotifications = response.data.notifications || [];

    // Transform backend notifications to frontend format
    return backendNotifications.map((notification: any) => ({
      id: notification.id,
      type: mapNotificationType(notification.type),
      title: notification.message || "Notification",
      description: formatDescription(notification.context),
      time: formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
      }),
      read: false, // Since we're fetching unread notifications
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// Map backend notification types to frontend types
function mapNotificationType(backendType: string): Notification["type"] {
  const typeMap: Record<string, Notification["type"]> = {
    ANSWER_CREATED: "answer",
    QUESTION_CREATED: "comment",
    MENTION: "mention",
    REPUTATION: "reputation",
    SUMMARY: "summary",
    FOLLOWER: "follower",
  };

  return typeMap[backendType] || "comment";
}

// Format the description from context, handling objects and other types
function formatDescription(context: any): string {
  if (!context) return "";

  // If context is an object, convert it to a readable string
  if (typeof context === "object") {
    // Handle specific context types
    if (context.tags && Array.isArray(context.tags)) {
      return `Tags: ${context.tags.join(", ")}`;
    }
    if (context.questionId) {
      return `Question ID: ${context.questionId}`;
    }
    if (context.authorId) {
      return `Author ID: ${context.authorId}`;
    }
    // Generic object handling
    return JSON.stringify(context, null, 2);
  }

  // If context is already a string, return it
  if (typeof context === "string") {
    return context;
  }

  // Convert other types to string
  return String(context);
}
