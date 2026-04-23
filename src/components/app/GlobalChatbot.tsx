"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface Message { role: "user" | "model"; content: string; }

export function GlobalChatbot() {
  const [open, setOpen] = useState(false);
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
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: messages }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || "Chatbot request failed");
      }

      if (!res.body) throw new Error("No response stream");

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
      const message = error instanceof Error ? error.message : "Chatbot unavailable";
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
    <>
      {/* FAB button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
        >
          <MessageSquare size={22} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-float-md flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
            <Bot size={18} />
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm">NoteBot</h3>
              <p className="text-[10px] text-white/70">AI Study Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot size={32} className="mx-auto text-brand-300 mb-3" />
                <p className="text-xs font-body text-slate-500 mb-3">Hi! I&apos;m NoteBot. Ask me anything about your studies.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Explain DBMS normalization", "Tips for DSA", "What is TCP/IP?"].map((s) => (
                    <button key={s} onClick={() => setInput(s)}
                      className="text-[10px] font-body text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors">
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
                <div className={`max-w-[80%] text-xs font-body leading-relaxed px-3 py-2 rounded-xl whitespace-pre-wrap ${m.role === "user" ? "bg-brand-500 text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"}`}>
                  {m.content || (streaming && i === messages.length - 1 ? "▋" : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask anything..."
              className="flex-1 text-xs font-body bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 placeholder:text-slate-400"
            />
            <button onClick={ask} disabled={streaming || !input.trim()}
              className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 shrink-0 self-end transition-colors">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
