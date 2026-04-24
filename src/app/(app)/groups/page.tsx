"use client";
import { useEffect, useState } from "react";
import { GroupCard } from "@/components/app/GroupCard";
import { Users, Plus, X, Link2, Copy, CheckCircle } from "lucide-react";
import { getAppBaseUrl } from "@/lib/app-url";
import toast from "react-hot-toast";

interface Group {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  isPrivate: boolean;
  isClassGroup: boolean;
  section: string | null;
  inviteCode: string;
  _count: { members: number; notes: number };
}

const SECTIONS = [
  "CS-A", "CS-B", "CS-C", "CS-D",
  "IT-A", "IT-B",
  "EC-A", "EC-B",
  "ME-A", "ME-B",
  "EE-A", "EE-B",
  "CE-A",
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("General");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isClassGroup, setIsClassGroup] = useState(false);
  const [section, setSection] = useState("CS-A");
  const [creating, setCreating] = useState(false);
  const [createdInvite, setCreatedInvite] = useState("");

  const fetchGroups = () => {
    setLoading(true);
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          subject,
          isPrivate,
          isClassGroup,
          section: isClassGroup ? section : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create group");
      }
      const group = await res.json();
      setCreatedInvite(group.inviteCode);
      toast.success("Group created! Share the invite link.");
      fetchGroups();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    // Extract code from URL or raw code
    let code = joinCode.trim();
    const urlMatch = code.match(/\/join\/([^/?]+)/);
    if (urlMatch) code = urlMatch[1];

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Joined ${data.groupName}!`);
        setShowJoin(false);
        setJoinCode("");
        fetchGroups();
      } else {
        toast.error(data.error || "Invalid code");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const resetCreateForm = () => {
    setShowCreate(false);
    setName("");
    setDescription("");
    setSubject("General");
    setIsPrivate(false);
    setIsClassGroup(false);
    setSection("CS-A");
    setCreatedInvite("");
  };

  const inviteUrl = createdInvite
    ? `${getAppBaseUrl()}/groups/join/${createdInvite}`
    : "";

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Study Groups</h1>
          <p className="font-body text-muted-foreground text-sm">Join a class group or create your own.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 bg-card border border-border text-foreground/90 font-body font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-accent transition-all"
          >
            <Link2 size={15} />
            Join by Code
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brand-500 text-white font-body font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-all shadow-md dark:shadow-none"
          >
            <Plus size={15} />
            Create Group
          </button>
        </div>
      </div>

      {/* Join by code modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-float-md p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-lg text-foreground">Join by Invite</h2>
              <button onClick={() => setShowJoin(false)} className="text-muted-foreground/80 hover:text-foreground/80"><X size={20} /></button>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-4">Paste an invite code or full invite link.</p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Invite code or URL..."
              className="w-full text-sm font-body bg-accent rounded-xl px-4 py-3 border border-border outline-none focus:border-brand-300 transition-all mb-4"
            />
            <button
              onClick={handleJoinByCode}
              disabled={!joinCode.trim()}
              className="w-full bg-brand-500 text-white font-body font-medium text-sm px-4 py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              Join Group
            </button>
          </div>
        </div>
      )}

      {/* Create group modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-float-md p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display font-bold text-lg text-foreground">Create Study Group</h2>
              <button onClick={resetCreateForm} className="text-muted-foreground/80 hover:text-foreground/80"><X size={20} /></button>
            </div>

            {createdInvite ? (
              /* Success state — show invite link */
              <div className="text-center py-4">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Group Created</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">Share this invite link with your classmates:</p>
                <div className="flex items-center gap-2 bg-accent border border-border rounded-xl px-4 py-3">
                  <input readOnly value={inviteUrl} className="flex-1 text-xs font-body bg-transparent outline-none text-foreground/90" />
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("Copied!"); }}
                    className="text-brand-500 hover:text-brand-600"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <button onClick={resetCreateForm} className="mt-5 bg-brand-500 text-white font-body font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-all">
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-display font-semibold text-foreground/90">Group Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CS-A Study Circle" className="w-full text-sm font-body bg-accent rounded-xl px-4 py-3 border border-border outline-none focus:border-brand-300 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-display font-semibold text-foreground/90">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={2} className="w-full text-sm font-body bg-accent rounded-xl px-4 py-3 border border-border outline-none focus:border-brand-300 transition-all resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-display font-semibold text-foreground/90">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full text-sm font-body bg-accent rounded-xl px-4 py-3 border border-border outline-none focus:border-brand-300 transition-all">
                    {["General", "DBMS", "OS", "CN", "DSA", "Maths", "Physics", "Chemistry"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isClassGroup} onChange={(e) => setIsClassGroup(e.target.checked)} className="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500" />
                    <span className="text-sm font-body text-foreground/90">This is a Class Group</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500" />
                    <span className="text-sm font-body text-foreground/90">Private (invite only)</span>
                  </label>
                </div>

                {isClassGroup && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-display font-semibold text-foreground/90">Section</label>
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full text-sm font-body bg-accent rounded-xl px-4 py-3 border border-border outline-none focus:border-brand-300 transition-all">
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim()}
                  className="w-full bg-brand-500 text-white font-body font-medium text-sm px-4 py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groups grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-card rounded-2xl border border-border shadow-card animate-pulse" />
          ))
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              members={group._count?.members || 0}
              notes={group._count?.notes || 0}
              subject={group.subject}
              isPrivate={group.isPrivate}
              isClassGroup={group.isClassGroup}
              section={group.section}
              inviteCode={group.inviteCode}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <Users size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground/80 font-body">No study groups yet. Start one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
