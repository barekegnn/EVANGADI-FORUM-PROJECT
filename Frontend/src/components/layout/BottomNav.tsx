"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-t-lg z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              href={href}
              key={label}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-muted-foreground w-full h-full",
                isActive && "text-primary"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className={cn("text-xs", isActive && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
