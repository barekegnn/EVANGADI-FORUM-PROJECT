"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Settings,
  LogOut,
  Edit3,
  Camera,
  Save,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  getCurrentUser,
  updateProfile,
  uploadProfilePicture,
  User as UserType,
} from "@/lib/data";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);

  // Form fields for editing
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    bio: "",
    phone: "",
    telegram: "",
    campus: "",
    yearOfStudy: "",
    fieldOfStudy: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
  });

  // Campus options
  const campusOptions = [
    { value: "main", label: "Main" },
    { value: "hit", label: "HiT" },
    { value: "station", label: "Station" },
    { value: "harar", label: "Harar" },
  ];

  // Year of study options
  const yearOptions = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" },
  ];

  // Load user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setEditForm({
        username: userData.username || "",
        email: userData.email || "",
        bio: userData.bio || "",
        phone: userData.phone || "",
        telegram: userData.telegram || "",
        campus: userData.campus || "",
        yearOfStudy: userData.yearOfStudy || "",
        fieldOfStudy: userData.fieldOfStudy || "",
      });
      setNotifications({
        email: userData.notificationPreferences?.email ?? true,
        push: userData.notificationPreferences?.push ?? true,
        newsletter: userData.notificationPreferences?.newsletter ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const handleEditClick = () => {
    if (user) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setNewProfilePicture(null);
    if (user) {
      setEditForm({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        telegram: user.telegram || "",
        campus: user.campus || "",
        yearOfStudy: user.yearOfStudy || "",
        fieldOfStudy: user.fieldOfStudy || "",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      // Update profile information
      const updatedUser = await updateProfile({
        username: editForm.username,
        email: editForm.email,
        bio: editForm.bio,
        phone: editForm.phone,
        telegram: editForm.telegram,
        campus: editForm.campus,
        yearOfStudy: editForm.yearOfStudy,
        fieldOfStudy: editForm.fieldOfStudy,
      });

      // Upload new profile picture if selected
      if (newProfilePicture) {
        const profilePictureUrl = await uploadProfilePicture(newProfilePicture);
        updatedUser.profilePicture = profilePictureUrl;
      }

      setUser(updatedUser);
      setIsEditing(false);
      setPreviewImage(null);
      setNewProfilePicture(null);

      // Dispatch a custom event to notify other components (like Header) that the profile has been updated
      window.dispatchEvent(new CustomEvent("profileUpdated"));

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setNewProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setNewProfilePicture(null);
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="py-4 px-6 bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-6 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 pb-20 space-y-6">
            <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="py-4 px-6 bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto">
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 pb-20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Failed to load profile data.
              </p>
              <Button onClick={() => fetchUserData()}>Retry</Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="py-4 px-6 bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 pb-20 space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                      {previewImage ? (
                        <AvatarImage src={previewImage} alt="Profile preview" />
                      ) : user.profilePicture ? (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.username}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-2xl">
                          {user.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer shadow-lg">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>

                  {previewImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive hover:text-destructive"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Profile Info Section */}
                <div className="flex-grow">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Name</Label>
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">{user.username}</h2>
                      <p className="text-muted-foreground">
                        {editForm.bio || "No bio provided yet."}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="+251 911 123 456"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telegram">Telegram Username</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Send className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="telegram"
                        value={editForm.telegram}
                        onChange={(e) =>
                          setEditForm({ ...editForm, telegram: e.target.value })
                        }
                        placeholder="@username"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="campus">Campus</Label>
                    <Select
                      value={editForm.campus}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, campus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map((campus) => (
                          <SelectItem key={campus.value} value={campus.value}>
                            {campus.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{editForm.phone || "Not provided"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {editForm.telegram
                        ? `@${editForm.telegram}`
                        : "Not provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {campusOptions.find((c) => c.value === editForm.campus)
                        ?.label || "Not provided"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fieldOfStudy">Field of Study</Label>
                    <Input
                      id="fieldOfStudy"
                      value={editForm.fieldOfStudy}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fieldOfStudy: e.target.value,
                        })
                      }
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                    <Select
                      value={editForm.yearOfStudy}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, yearOfStudy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{editForm.fieldOfStudy || "Not provided"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {yearOptions.find((y) => y.value === editForm.yearOfStudy)
                        ?.label || "Not provided"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements and Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {user.reputation || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reputation
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {user.questionsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {user.answersCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Answers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates via email
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange("email")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive push notifications
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange("push")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Newsletter</div>
                    <div className="text-sm text-muted-foreground">
                      Receive monthly newsletter
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newsletter}
                    onCheckedChange={() =>
                      handleNotificationChange("newsletter")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
