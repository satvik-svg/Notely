"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">N</span>
        </div>
        <span className="font-display font-semibold text-slate-900 dark:text-white text-lg">NoteShare</span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Groups", "Leaderboard", "Pricing"].map((item) => (
          <Link
            key={item}
            href="#"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-body"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-body">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="text-sm bg-brand-500 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors font-body font-medium shadow-sm"
        >
          Get started
        </Link>
      </div>
    </motion.nav>

  );
}
