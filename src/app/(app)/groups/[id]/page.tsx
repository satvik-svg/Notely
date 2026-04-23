"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Users, BookOpen, Copy, ArrowLeft, MessageSquare, FileText, Upload } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { getAppBaseUrl } from "@/lib/app-url";
import { NoteCard } from "@/components/app/NoteCard";
import toast from "react-hot-toast";
import Link from "next/link";

interface GroupMessage {
  id: string;
  text: string;
  author: { id: string; name: string };
  createdAt: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  isClassGroup: boolean;
  section: string | null;
  inviteCode: string;
  _count: { members: number; notes: number };
  members: { user: { id: string; name: string; karma: number; section: string | null }; role: string }[];
  notes: any[];
  messages: GroupMessage[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chat" | "notes" | "members">("chat");
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetch(`/api/groups/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setGroup(data);
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load group"); setLoading(false); });
  }, [id]);

  useEffect(() => {
    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`group-${id}`);
    channel.bind("new-message", (msg: GroupMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => { pusherClient.unsubscribe(`group-${id}`); };
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const tempMsg: GroupMessage = {
      id: `temp-${Date.now()}`,
      text,
      author: { id: "me", name: "You" },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const copyInvite = () => {
    if (!group) return;
    const url = `${getAppBaseUrl()}/groups/join/${group.inviteCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied!");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-20 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse" />
        <div className="h-96 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse" />
      </div>
    );
  }

  if (!group) {
    return <div className="text-center py-20 text-slate-400 font-body">Group not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/groups")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-xl text-slate-900">{group.name}</h1>
              {group.isClassGroup && group.section && (
                <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-body font-medium">{group.section}</span>
              )}
            </div>
            <p className="text-xs font-body text-slate-400">
              {group.subject} · {group._count.members} members · {group._count.notes} notes
            </p>
          </div>
          <button onClick={copyInvite} className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 font-body text-xs px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Copy size={13} /> Invite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([["chat", MessageSquare, "Chat"], ["notes", FileText, "Notes"], ["members", Users, "Members"]] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-body font-medium transition-all ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Chat */}
      {tab === "chat" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden flex flex-col" style={{ height: 480 }}>
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-center text-xs font-body text-slate-400 py-10">No messages yet. Start the conversation!</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.author.id === "me" ? "justify-end" : ""}`}>
                {m.author.id !== "me" && (
                  <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-display font-bold text-brand-600">
                      {m.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="max-w-[75%]">
                  {m.author.id !== "me" && (
                    <span className="text-[10px] font-display font-semibold text-slate-500 block mb-0.5">{m.author.name}</span>
                  )}
                  <div className={`text-xs font-body leading-relaxed px-3 py-2 rounded-xl ${m.author.id === "me" ? "bg-brand-500 text-white rounded-br-sm" : "bg-slate-50 text-slate-700 rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 text-xs font-body bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 placeholder:text-slate-400"
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 shrink-0 self-end transition-colors">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div className="space-y-5">
          {/* Upload button for group */}
          <div className="flex justify-end">
            <Link
              href={`/notes/upload?groupId=${id}`}
              className="flex items-center gap-2 bg-brand-500 text-white font-body font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-all shadow-md"
            >
              <Upload size={15} />
              Share Notes to Group
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.notes.length > 0 ? (
              group.notes.map((note: any) => <NoteCard key={note.id} {...note} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-body text-slate-400 mb-3">No notes shared in this group yet.</p>
                <Link
                  href={`/notes/upload?groupId=${id}`}
                  className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 font-body font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-brand-100 transition-colors"
                >
                  <Upload size={14} />
                  Upload the first note
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members */}
      {tab === "members" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div className="space-y-3">
            {group.members.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-display font-bold text-brand-600">
                    {m.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-display font-semibold text-slate-900">{m.user.name}</p>
                  <p className="text-xs font-body text-slate-400">
                    {m.user.section || "—"} · {m.user.karma} karma
                  </p>
                </div>
                {m.role === "admin" && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-body font-medium">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
