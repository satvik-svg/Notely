"use client";
import { useState } from "react";
import toast from "react-hot-toast";

function useSummary(noteId: string) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/summary`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate summary");
      }

      setSummary(data?.summary ?? "");

      if (data?.source === "fallback") {
        toast(data?.message || "AI is unavailable, showing a fallback summary.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate summary";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, generate };
}

export function AISummaryPanel({ noteId }: Readonly<{ noteId: string }>) {
  const { summary, loading, generate } = useSummary(noteId);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand-100 rounded-md flex items-center justify-center">
            <span className="text-brand-600 text-[10px]">AI</span>
          </div>
          <h3 className="font-display font-semibold text-slate-800 text-sm dark:text-slate-200">AI Summary</h3>
        </div>
        {!summary && (
          <button
            onClick={generate}
            disabled={loading}
            className="text-xs font-body font-medium text-brand-500 hover:text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 dark:bg-slate-800"
          >
            {loading ? "Generating..." : "Generate ✦"}
          </button>
        )}
      </div>
      {summary && (
        <div className="text-xs font-body text-slate-600 leading-relaxed whitespace-pre-wrap dark:text-slate-400">
          {summary}
        </div>
      )}
      {!summary && !loading && (
        <p className="text-xs font-body text-slate-400 dark:text-slate-500">
          Get an AI-powered TL;DR of this note in seconds.
        </p>
      )}
    </div>
  );
}
