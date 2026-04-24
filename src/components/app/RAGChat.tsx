"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Message { role: "user" | "model"; content: string; }

export function RAGChat({ noteId }: { noteId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ask = async () => {
    if (!input.trim() || streaming) return;
    const question = input.trim();
    setInput("");

    const updated: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...updated, { role: "model", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/notes/${noteId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: messages }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || "Chatbot request failed");
      }

      if (!res.body) {
        throw new Error("No response stream from chatbot");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "model", content: full };
          return copy;
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chatbot is currently unavailable";
      toast.error(message);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "model", content: message };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-accent/50">
        <Bot size={14} className="text-brand-500" />
        <h3 className="font-display font-semibold text-card-foreground text-sm">Notes Doubt Bot</h3>
        <span className="ml-auto text-[10px] font-body bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md">Chatbot</span>
      </div>

      {/* Messages */}
      <div className="px-5 py-4 space-y-3 min-h-[180px] max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs font-body text-muted-foreground/80">Ask any doubt about this note</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {["Explain this topic simply", "Give me exam-focused points", "What should I revise first?"].map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs font-body text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "model" && (
              <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={11} className="text-brand-600" />
              </div>
            )}
            <div className={`max-w-[80%] text-xs font-body leading-relaxed px-3 py-2 rounded-xl ${m.role === "user" ? "bg-brand-500 text-white rounded-br-sm" : "bg-accent text-foreground/90 rounded-bl-sm"}`}>
              {m.content || (streaming && i === messages.length - 1 ? "▋" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Type your doubt about this note..."
          className="flex-1 text-xs font-body bg-accent rounded-xl px-3 py-2.5 border border-border outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 placeholder:text-muted-foreground/80"
        />
        <button onClick={ask} disabled={streaming || !input.trim()}
          className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 shrink-0 self-end">
          <Send size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}
