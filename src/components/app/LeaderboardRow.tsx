import { Trophy } from "lucide-react";
import { computeBadge } from "@/lib/badges";

export function LeaderboardRow({ rank, name, karma, uploads, dept }: {
  rank: number;
  name: string;
  karma: number;
  uploads: number;
  dept: string;
}) {
  const badge = computeBadge(karma);

  const rankColors: Record<number, string> = { 1: "text-yellow-500", 2: "text-slate-400", 3: "text-orange-500" };
  
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-card px-5 py-4 hover:shadow-float transition-all dark:bg-slate-900 dark:border-slate-800">
      <span className={`font-display font-bold text-lg w-6 text-center ${rankColors[rank] ?? "text-slate-400"}`}>
        {rank}
      </span>
      <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
        <span className="text-xs font-display font-bold text-brand-600">
          {name.split(" ").map((n) => n[0]).join("")}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100">{name}</p>
        <p className="text-xs font-body text-slate-400 dark:text-slate-500">{dept} · {uploads} uploads · {badge}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-display font-bold text-brand-500">⬆ {karma}</p>
        <p className="text-xs font-body text-slate-400 dark:text-slate-500">karma</p>
      </div>
    </div>
  );
}
