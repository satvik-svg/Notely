import toast from "react-hot-toast";

export function GroupCard({ name, members, subject, id, isPrivate }: { name: string, members: number, subject: string, id: string, isPrivate: boolean }) {
  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/groups/${id}/join`, {
        method: "POST",
        body: JSON.stringify({}), // code if private, but we'll keep it simple for now
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(`Joined ${name}!`);
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to join");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-float hover:border-slate-200 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-body text-slate-400 uppercase tracking-wider dark:text-slate-500">
          {subject}
        </span>
        {isPrivate && <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">Private</span>}
      </div>
      <h3 className="font-display font-semibold text-slate-900 text-sm mb-1 dark:text-slate-100">{name}</h3>
      <p className="text-xs font-body text-slate-400 mb-4 dark:text-slate-500">{members} members</p>
      
      <button 
        onClick={handleJoin}
        className="w-full bg-brand-50 text-brand-600 font-body font-medium text-xs px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors dark:bg-slate-800">
        Join Group
      </button>
    </div>
  );
}

