"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "@/lib/notifications";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useNotificationContext } from "@/components/Header";
import Header from "@/components/Header";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
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
        <Header />
        <header className="py-4 px-6 bg-background border-b">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
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
