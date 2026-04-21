"use client";
import { useEffect, useState } from "react";
import { LeaderboardRow } from "@/components/app/LeaderboardRow";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2 dark:text-slate-100">Leaderboard</h1>
        <p className="font-body text-slate-500 dark:text-slate-400">Top contributors making learning easier for everyone.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse dark:bg-slate-900 dark:border-slate-800" />
          ))
        ) : users.length > 0 ? (
          users.map((user: any, index: number) => (
            <LeaderboardRow 
              key={user.id} 
              rank={index + 1} 
              name={user.name} 
              karma={user.karma} 
              uploads={user._count?.notes || 0}
              dept="CS" // default or add to user model
            />
          ))
        ) : (
          <div className="text-center py-20 text-slate-400 font-body dark:text-slate-500">No one on the leaderboard yet. Be the first!</div>
        )}
      </div>
    </div>
  );
}
