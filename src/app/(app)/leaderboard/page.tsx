"use client";
import { useEffect, useState } from "react";
import { LeaderboardRow } from "@/components/app/LeaderboardRow";
import { Trophy, Users, Flame, BookOpen, MessageSquare } from "lucide-react";

interface ClassData {
  section: string;
  totalKarma: number;
  totalUploads: number;
  totalComments: number;
  totalUpvotes: number;
  memberCount: number;
  avgStreak: number;
  activityScore: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"students" | "classes">("students");
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === "students") {
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then((data) => { setUsers(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      fetch("/api/leaderboard/classes")
        .then((r) => r.json())
        .then((data) => { setClasses(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab]);

  const maxScore = classes.length > 0 ? classes[0].activityScore : 1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Leaderboard</h1>
        <p className="font-body text-slate-500">Top contributors making learning easier for everyone.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("students")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${tab === "students" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Trophy size={15} /> Students
        </button>
        <button
          onClick={() => setTab("classes")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${tab === "classes" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Users size={15} /> Class vs Class
        </button>
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse" />
            ))
          ) : users.length > 0 ? (
            users.map((user: any, index: number) => (
              <LeaderboardRow
                key={user.id}
                rank={index + 1}
                name={user.name}
                karma={user.karma}
                uploads={user._count?.notes || 0}
                dept={user.department || user.section || "—"}
              />
            ))
          ) : (
            <div className="text-center py-20 text-slate-400 font-body">No one on the leaderboard yet. Be the first!</div>
          )}
        </div>
      )}

      {/* Classes tab */}
      {tab === "classes" && (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse" />
            ))
          ) : classes.length > 0 ? (
            classes.map((cls, index) => {
              const rankColors: Record<number, string> = { 0: "from-yellow-400 to-amber-500", 1: "from-slate-300 to-slate-400", 2: "from-orange-400 to-amber-600" };
              const barWidth = Math.max((cls.activityScore / maxScore) * 100, 8);

              return (
                <div key={cls.section} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-float transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    {/* Rank badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold bg-gradient-to-br ${rankColors[index] || "from-slate-200 to-slate-300"}`}>
                      {index + 1}
                    </div>
                    {/* Section name */}
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-slate-900">{cls.section}</h3>
                      <p className="font-body text-xs text-slate-400">
                        {cls.memberCount} active members
                      </p>
                    </div>
                    {/* Score */}
                    <div className="text-right">
                      <p className="font-display font-bold text-xl text-brand-500">{cls.activityScore.toLocaleString()}</p>
                      <p className="font-body text-[10px] text-slate-400 uppercase tracking-wider">Activity Score</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${rankColors[index] || "from-brand-400 to-brand-500"}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-5 text-xs font-body text-slate-500">
                    <span className="flex items-center gap-1"><Trophy size={12} className="text-amber-500" /> {cls.totalKarma} karma</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} className="text-brand-500" /> {cls.totalUploads} uploads</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} className="text-green-500" /> {cls.totalComments} comments</span>
                    <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {cls.avgStreak} avg streak</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Users size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-body">No class data yet. Students need to set their section in profile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
