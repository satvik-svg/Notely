"use client";
import { useEffect, useState } from "react";
import { GroupCard } from "@/components/app/GroupCard";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-2 dark:text-slate-100">Study Groups</h1>
          <p className="font-body text-slate-500 text-sm dark:text-slate-400">Join a class group or create your own.</p>
        </div>
        <button className="bg-brand-500 text-white font-body font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-all shadow-md">
          + Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse dark:bg-slate-900 dark:border-slate-800" />
          ))
        ) : groups.length > 0 ? (
          groups.map((group: any) => (
            <GroupCard 
              key={group.id} 
              id={group.id}
              name={group.name}
              members={group._count?.members || 0}
              subject={group.subject}
              isPrivate={group.isPrivate}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-slate-400 font-body dark:text-slate-500">No study groups yet. Start one!</div>
        )}
      </div>
    </div>
  );
}
