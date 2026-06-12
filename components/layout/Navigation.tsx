"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart2, Settings, Home } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:relative md:border-t-0 md:border-r md:h-screen md:w-56 md:flex-shrink-0">
      <div className="flex justify-around md:flex-col md:p-4 md:gap-1 md:pt-8">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 rounded-lg text-xs md:text-sm font-medium transition-colors",
              pathname === href
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
            <span className="md:hidden text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
