"use client";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  text: string;
  author: { id: string; name: string };
  createdAt: string;
}

export function NoteDiscussionChat({ noteId }: { noteId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing comments
  useEffect(() => {
    if (!noteId) return;
    fetch(`/api/notes/${noteId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(console.error);
  }, [noteId]);

  // Subscribe to real-time new comments
  useEffect(() => {
    if (!noteId) return;
    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`note-${noteId}`);

    channel.bind("new-comment", (data: Comment) => {
      setComments((prev) => {
        // Avoid duplicates (our own comment already added optimistically)
        if (prev.some((c) => c.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      pusherClient.unsubscribe(`note-${noteId}`);
    };
  }, [noteId]);

  const sendComment = async () => {
    if (!input.trim() || loading || !noteId) return;
    const text = input.trim();
    setInput("");
    setLoading(true);

    // Optimistic update — show immediately
    const tempId = `temp-${Date.now()}`;
    const newComment = {
      id: tempId,
      text,
      author: { id: "me", name: "You" },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);

    try {
      await fetch(`/api/notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error(err);
      // Optional: remove optimistic comment on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <MessageCircle size={15} className="text-brand-500" />
        <h3 className="font-display font-semibold text-card-foreground text-sm">Discussion</h3>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Live indicator */}
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-body text-muted-foreground/80">live</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 max-h-72 overflow-y-auto">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-display font-bold text-brand-600">
                  {c.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-display font-semibold text-card-foreground">{c.author.name}</span>
                  <span className="text-[10px] font-body text-muted-foreground/80">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed mt-0.5">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-xs font-body text-muted-foreground/80 text-center py-4">
            Be the first to comment on this note
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendComment()}
          placeholder="Ask or comment..."
          className="flex-1 text-xs font-body bg-accent rounded-xl px-3 py-2.5 border border-border outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 placeholder:text-muted-foreground/80"
        />
        <button
          onClick={sendComment}
          className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors shrink-0 self-end"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}
