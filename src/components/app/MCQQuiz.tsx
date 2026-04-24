"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface MCQ { question: string; options: string[]; answer: number; explanation: string; }

export function MCQQuiz({ noteId }: Readonly<{ noteId: string }>) {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/mcq`, {
        method: "POST",
        body: JSON.stringify({ count: 5 }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate MCQ quiz");
      }

      setMcqs(Array.isArray(data?.mcqs) ? data.mcqs : []);

      if (data?.source === "fallback") {
        toast(data?.message || "AI is unavailable, showing fallback MCQs.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate MCQ quiz";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const choose = (idx: number) => {
    if (selected !== null) return; // already answered
    setSelected(idx);
    if (idx === mcqs[current].answer) setScore((s) => s + 1);

    // Fire-and-forget: track recall event
    fetch("/api/recall/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noteId,
        event: idx === mcqs[current].answer ? "correct" : "wrong",
      }),
    }).catch(() => { });
  };

  const next = () => {
    if (current + 1 >= mcqs.length) { setDone(true); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  const getResultMessage = () => {
    if (score === mcqs.length) return "Perfect score! 🔥";
    if (score >= mcqs.length / 2) return "Good job! Keep studying";
    return "Review the notes and try again";
  };

  const getOptionClassName = (idx: number, correctAnswer: number, selectedAnswer: number | null) => {
    if (selectedAnswer === null) {
      return "border-border hover:border-brand-300 hover:bg-brand-50 text-foreground/90";
    }
    if (idx === correctAnswer) {
      return "border-green-300 bg-green-50 text-green-800";
    }
    if (idx === selectedAnswer) {
      return "border-red-300 bg-red-50 text-red-700";
    }
    return "border-border text-muted-foreground/80";
  };

  if (!mcqs.length) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] bg-purple-50 text-purple-600 font-body font-medium px-2 py-0.5 rounded-md">AI QUIZ</span>
          <h3 className="font-display font-semibold text-card-foreground text-sm">Test yourself</h3>
        </div>
        <p className="text-xs font-body text-muted-foreground/80 mb-3">Auto-generated MCQs from this note.</p>
        <button onClick={generate} disabled={loading}
          className="text-xs font-body font-medium bg-brand-500 text-white px-4 py-2 rounded-xl hover:bg-brand-600 disabled:opacity-50">
          {loading ? "Generating questions..." : "Generate MCQ quiz ✦"}
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card p-5 text-center">
        <p className="font-display font-bold text-2xl text-foreground">{score}/{mcqs.length}</p>
        <p className="text-sm font-body text-muted-foreground mt-1">{getResultMessage()}</p>
        <button onClick={() => { setMcqs([]); setCurrent(0); setSelected(null); setScore(0); setDone(false); }}
          className="mt-4 text-xs font-body text-brand-500 hover:text-brand-600">
          Try again
        </button>
      </div>
    );
  }

  const q = mcqs[current];
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] bg-purple-50 text-purple-600 font-body font-medium px-2 py-0.5 rounded-md">AI QUIZ</span>
        <span className="text-xs font-body text-muted-foreground/80">{current + 1} / {mcqs.length}</span>
      </div>
      <p className="text-sm font-display font-semibold text-card-foreground mb-4 leading-snug">{q.question}</p>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => {
          const optionClassName = getOptionClassName(idx, q.answer, selected);
          return (
            <button key={`${q.question}-${opt}`} onClick={() => choose(idx)}
              className={`w-full text-left text-xs font-body px-3 py-2.5 rounded-xl border transition-all ${optionClassName}`}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <>
          <p className="text-xs font-body text-muted-foreground bg-accent rounded-xl p-3 mb-3">{q.explanation}</p>
          <button onClick={next} className="text-xs font-body font-medium text-brand-500 hover:text-brand-600">
            {current + 1 >= mcqs.length ? "See results →" : "Next question →"}
          </button>
        </>
      )}
    </div>
  );
}
