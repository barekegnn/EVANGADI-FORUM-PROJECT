"use client";

import { Bell, Edit, Settings, LogOut, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const userImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-avatar"
  );
  const profileImage = placeholderImages.find(
    (p: PlaceholderImage) => p.id === "user-profile-lg"
  );

  const expertiseTags = [
    "Computer Science",
    "Data Structures",
    "Algorithms",
    "React",
    "Mobile Development",
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="bg-background min-h-screen flex flex-col">
        <header className="py-4 px-6 bg-background border-b border-border/20 shadow-sm sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <div className="flex items-center gap-4">
              <Link href="/notifications">
                <Bell className="h-6 w-6 text-foreground" />
              </Link>
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

        <main className="flex-grow p-4 pb-20 space-y-6">
          <Card className="text-center p-6 bg-card">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary">
                {profileImage && (
                  <AvatarImage
                    src={profileImage.imageUrl}
                    alt="Haramaya Student"
                  />
                )}
                <AvatarFallback>HS</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-2xl font-bold">Haramaya Student</h2>
            <p className="text-muted-foreground mb-4">
              student@haramaya.edu.et
            </p>
            <Button variant="outline" className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Card>

          <Card className="bg-green-100/10 dark:bg-green-900/20 p-4">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-foreground/80 mb-2">
                Your Reputation
              </p>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">1250</span>
                <Badge variant="secondary" className="bg-secondary/50">
                  <Award className="mr-2 h-4 w-4" />
                  Top Contributor
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">Expertise Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {expertiseTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="secondary" className="w-full">
                <Settings className="mr-2 h-4 w-4" /> Manage Expertise
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">Notification Preferences</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable Email Notifications</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Button
            variant="destructive"
            className="w-full h-12 text-base"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
