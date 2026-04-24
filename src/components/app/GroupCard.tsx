"use client";
import { Copy, Users, BookOpen, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAppBaseUrl } from "@/lib/app-url";
import toast from "react-hot-toast";

export function GroupCard({
  name, members, notes, subject, id, isPrivate, isClassGroup, section, inviteCode
}: {
  name: string;
  members: number;
  notes: number;
  subject: string;
  id: string;
  isPrivate: boolean;
  isClassGroup: boolean;
  section: string | null;
  inviteCode: string;
}) {
  const router = useRouter();

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/groups/${id}/join`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(`Joined ${name}!`);
        router.push(`/groups/${id}`);
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to join");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const copyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${getAppBaseUrl()}/groups/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied!");
  };

  return (
    <div
      onClick={() => router.push(`/groups/${id}`)}
      className="bg-card rounded-2xl border border-border shadow-card p-5 hover:shadow-float hover:border-border transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-body text-muted-foreground/80 uppercase tracking-wider">
          {subject}
        </span>
        <div className="flex gap-1.5">
          {isClassGroup && (
            <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-body font-medium">
              {section}
            </span>
          )}
          {isPrivate && (
            <span className="text-[10px] bg-accent text-muted-foreground px-2 py-0.5 rounded flex items-center gap-1">
              <Shield size={8} /> Private
            </span>
          )}
        </div>
      </div>
      <h3 className="font-display font-semibold text-foreground text-sm mb-1">{name}</h3>
      <div className="flex items-center gap-3 text-xs font-body text-muted-foreground/80 mb-4">
        <span className="flex items-center gap-1"><Users size={12} />{members} members</span>
        <span className="flex items-center gap-1"><BookOpen size={12} />{notes} notes</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleJoin}
          className="flex-1 bg-brand-50 text-brand-600 font-body font-medium text-xs px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors"
        >
          Join & Open
        </button>
        <button
          onClick={copyInvite}
          className="bg-accent text-muted-foreground font-body text-xs px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
          title="Copy invite link"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}
