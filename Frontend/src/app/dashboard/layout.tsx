import Header from "@/components/Header";
import { cookies } from "next/headers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side: we don't do any redirection here to avoid SSR issues
  // Client-side ProtectedRoute component will handle authentication

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
