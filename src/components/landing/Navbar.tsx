"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-card/80 backdrop-blur-md border-b border-border"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Image
            src="/ChatGPT_Image_Apr_24__2026__02_56_58_AM-removebg-preview.png"
            alt="NoteShare Logo"
            fill
            className="object-contain drop-shadow-md"
          />
        </div>
        <span className="font-display font-semibold text-foreground text-xl tracking-tight">NoteShare</span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Groups", "Leaderboard", "Pricing"].map((item) => (
          <Link
            key={item}
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground font-body">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="text-sm bg-brand-500 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors font-body font-medium shadow-sm dark:shadow-none"
        >
          Get started
        </Link>
      </div>
    </motion.nav>

  );
}
