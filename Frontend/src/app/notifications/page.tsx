"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "@/lib/notifications";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useNotificationContext } from "@/components/Header";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );
  const { refreshNotificationCount } = useNotificationContext();

  useEffect(() => {
    async function fetchNotifications() {
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
      // Refresh the notification count in the header when visiting the notifications page
      refreshNotificationCount();
    }
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    const count = await markAllNotificationsAsRead();
    // Refresh the notification count in the header
    refreshNotificationCount();
    // Clear the notifications list
    setNotifications([]);
  };

  return (
    <ProtectedRoute>
      <div className="bg-background min-h-screen flex flex-col">
        <header className="py-4 px-6 bg-background border-b shadow-sm sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <div className="flex items-center gap-4">
              <Bell className="h-6 w-6 text-foreground" />
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  {userImage && (
                    <AvatarImage src={userImage.imageUrl} alt="User avatar" />
                  )}
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 pb-20">
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notifications
              </div>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
