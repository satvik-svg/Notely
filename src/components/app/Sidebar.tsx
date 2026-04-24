"use client";
import { BookOpen, Users, Trophy, Upload, Home, Star, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/favorites", icon: Star, label: "My Saved Notes" },
  { href: "/notes", icon: BookOpen, label: "Browse Notes" },
  { href: "/pyq", icon: FileText, label: "PYQ Papers" },
  { href: "/notes/upload", icon: Upload, label: "Upload Notes" },
  { href: "/groups", icon: Users, label: "Study Groups" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitial = session?.user?.name?.[0] || "U";
  const karma = (session?.user as any)?.karma || 0;

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col py-6 px-3 shrink-0">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="relative w-8 h-8 group-hover:scale-105 transition-transform">
          <Image
            src="/ChatGPT_Image_Apr_24__2026__02_56_58_AM-removebg-preview.png"
            alt="NoteShare Logo"
            fill
            className="object-contain drop-shadow-sm"
          />
        </div>
        <span className="font-display font-semibold text-foreground tracking-tight text-lg">NoteShare</span>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-300",
                active
                  ? "bg-brand-50 text-brand-600 font-medium shadow-sm dark:shadow-none"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User at bottom */}
      <div className="px-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-display font-bold text-brand-600">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-semibold text-card-foreground truncate">{session?.user?.name || "User"}</p>
            <p className="text-[10px] font-body text-brand-500">⬆ {karma} karma</p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 text-xs font-body text-muted-foreground/80 hover:text-red-500 transition-colors px-1"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
