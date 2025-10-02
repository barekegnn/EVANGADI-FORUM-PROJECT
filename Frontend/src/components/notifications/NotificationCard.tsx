"use client";

import { cn } from "@/lib/utils";
import { Notification } from "@/lib/notifications";
import {
  MessageSquare,
  User,
  Award,
  Lightbulb,
  Bell as BellIcon,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface NotificationCardProps {
  notification: Notification;
}

const iconMap = {
  comment: MessageSquare,
  mention: User,
  reputation: Award,
  answer: Lightbulb,
  summary: BellIcon,
  follower: User,
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const Icon = iconMap[notification.type as keyof typeof iconMap] || BellIcon;

  return (
    <Card className="p-4 flex items-start gap-4 cursor-pointer hover:bg-card/90 transition-colors">
      <div className="relative">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            notification.type === "reputation"
              ? "bg-yellow-100 dark:bg-yellow-900"
              : notification.type === "answer"
              ? "bg-green-100 dark:bg-green-900"
              : "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              notification.type === "reputation"
                ? "text-yellow-500"
                : notification.type === "answer"
                ? "text-green-500"
                : "text-muted-foreground"
            )}
          />
        </div>
        {!notification.read && (
          <span className="absolute top-0 left-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        )}
      </div>
      <div className="flex-1">
        <p
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: notification.title }}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {notification.description}
        </p>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <p className="whitespace-nowrap">{notification.time}</p>
        <ChevronRight className="h-5 w-5 mt-2 ml-auto" />
      </div>
    </Card>
  );
}
