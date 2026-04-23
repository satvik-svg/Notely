"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const { data: session } = useSession();
    const userName = session?.user?.name ?? "there";

    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
    const [streakLoaded, setStreakLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/streak", { method: "POST" })
            .then((r) => r.json())
            .then((data) => {
                setStreak({
                    currentStreak: data.currentStreak ?? 0,
                    longestStreak: data.longestStreak ?? 0,
                });
                setStreakLoaded(true);
            })
            .catch(() => setStreakLoaded(true));
    }, []);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                    Welcome back, {userName}
                </h1>
                <p className="text-slate-500 font-body text-sm mt-1">
                    Here&apos;s your study progress at a glance.
                </p>
            </motion.div>

            {/* Streak + Stats row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
                {/* Streak card */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={20} className="text-yellow-200" />
                            <span className="font-body text-sm text-white/80 font-medium">Daily Streak</span>
                        </div>
                        <p className="font-display font-bold text-4xl mb-1">
                            {streakLoaded ? streak.currentStreak : "—"}
                        </p>
                        <p className="font-body text-xs text-white/70">
                            {streak.currentStreak === 0 ? "Start your streak today!" :
                             streak.currentStreak === 1 ? "day — keep it going!" :
                             "days — keep the momentum!"}
                        </p>
                    </div>
                </div>

                {/* Longest streak */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy size={18} className="text-amber-500" />
                        <span className="font-body text-sm text-slate-500 font-medium">Best Streak</span>
                    </div>
                    <p className="font-display font-bold text-3xl text-slate-900">
                        {streakLoaded ? streak.longestStreak : "—"}
                    </p>
                    <p className="font-body text-xs text-slate-400 mt-1">Your personal record</p>
                </div>

                {/* Karma */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={18} className="text-brand-500" />
                        <span className="font-body text-sm text-slate-500 font-medium">Karma</span>
                    </div>
                    <p className="font-display font-bold text-3xl text-slate-900">
                        {(session?.user as any)?.karma ?? 0}
                    </p>
                    <p className="font-body text-xs text-slate-400 mt-1">Upload notes to earn more</p>
                </div>
            </motion.div>
        </div>
    );
}
