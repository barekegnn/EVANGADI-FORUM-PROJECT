"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { getUserByUsername } from "@/lib/data";
import { placeholderImages } from "@/lib/placeholder-images";
import type { PlaceholderImage } from "@/lib/placeholder-images";
import type { User } from "@/lib/data";

interface UserProfileModalProps {
  username: string;
  onClose: () => void;
}

export function UserProfileModal({ username, onClose }: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the default user avatar placeholder
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserByUsername(username);
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500">{error || "User not found"}</p>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Profile</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              {user.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user.username} />
              ) : userImage ? (
                <AvatarImage src={userImage.imageUrl} alt="User avatar" />
              ) : (
                <AvatarFallback className="text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-xl font-bold mt-4">{user.username}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">About</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {user.bio || "No bio available"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Reputation</h3>
                <p className="text-sm">{user.reputation || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold">Campus</h3>
                <p className="text-sm">{user.campus || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Questions</h3>
                <p className="text-sm">{user.questionsCount || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold">Answers</h3>
                <p className="text-sm">{user.answersCount || 0}</p>
              </div>
            </div>

            {(user.phone || user.telegram) && (
              <div>
                <h3 className="font-semibold">Contact</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {user.phone && <p>Phone: {user.phone}</p>}
                  {user.telegram && <p>Telegram: {user.telegram}</p>}
                </div>
              </div>
            )}

            {user.fieldOfStudy && (
              <div>
                <h3 className="font-semibold">Field of Study</h3>
                <p className="text-sm text-muted-foreground">
                  {user.fieldOfStudy}
                </p>
              </div>
            )}

            {user.yearOfStudy && (
              <div>
                <h3 className="font-semibold">Year of Study</h3>
                <p className="text-sm text-muted-foreground">
                  {user.yearOfStudy}
                </p>
              </div>
            )}

            {user.expertiseTags && user.expertiseTags.length > 0 && (
              <div>
                <h3 className="font-semibold">Expertise</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.expertiseTags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
