"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RotateCcw, ChevronRight } from "lucide-react";

interface RecallMCQ {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
}

interface RecallContent {
    flashcard: { question: string; answer: string };
    mcqs: RecallMCQ[];
    shortAnswer: { question: string; sampleAnswer: string };
    source: "ai" | "fallback";
}

export function RecallCard({
    noteChunkId,
    noteId,
}: Readonly<{ noteChunkId: string; noteId: string }>) {
    const [content, setContent] = useState<RecallContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [mcqSelected, setMcqSelected] = useState<Record<number, number>>({});

    const generate = async () => {
        setLoading(true);
        setFlipped(false);
        setMcqSelected({});
        try {
            const res = await fetch("/api/recall/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteChunkId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate recall");
            setContent(data);
            if (data.source === "fallback") {
                toast("AI unavailable, showing fallback content.");
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to generate recall"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMcqAnswer = (mcqIndex: number, optionIndex: number) => {
        if (mcqSelected[mcqIndex] !== undefined) return;
        setMcqSelected((prev) => ({ ...prev, [mcqIndex]: optionIndex }));

        const isCorrect = content?.mcqs[mcqIndex]?.answer === optionIndex;
        // Fire-and-forget tracking
        fetch("/api/recall/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                noteChunkId,
                noteId,
                event: isCorrect ? "correct" : "wrong",
            }),
        }).catch(() => { });
    };

    if (!content) {
        return (
            <button
                onClick={generate}
                disabled={loading}
                className="w-full flex items-center gap-2 text-xs font-body font-medium bg-purple-50 text-purple-600 px-4 py-2.5 rounded-xl hover:bg-purple-100 disabled:opacity-50 transition-all"
            >
                <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
                {loading ? "Generating..." : "🧠 Revise Now"}
            </button>
        );
    }

    return (
        <div className="space-y-3">
            {/* Flashcard */}
            <div
                onClick={() => setFlipped(!flipped)}
                className="bg-gradient-to-br from-purple-50 to-brand-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-purple-100"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-body font-medium text-purple-500 uppercase tracking-wider">
                        Flashcard · {flipped ? "Answer" : "Question"}
                    </span>
                    <ChevronRight
                        size={12}
                        className={`text-purple-400 transition-transform ${flipped ? "rotate-90" : ""}`}
                    />
                </div>
                <p className="text-xs font-body text-foreground/90 leading-relaxed">
                    {flipped ? content.flashcard.answer : content.flashcard.question}
                </p>
                <p className="text-[10px] font-body text-purple-400 mt-2">
                    {flipped ? "Click to see question" : "Click to reveal answer"}
                </p>
            </div>

            {/* MCQs */}
            {content.mcqs.map((mcq, mi) => (
                <div
                    key={`recall-mcq-${mi}`}
                    className="bg-card rounded-xl border border-border p-3"
                >
                    <p className="text-xs font-display font-semibold text-card-foreground mb-2 leading-snug">
                        {mcq.question}
                    </p>
                    <div className="space-y-1.5">
                        {mcq.options.map((opt, oi) => {
                            const selected = mcqSelected[mi];
                            let className =
                                "border-border hover:border-brand-300 hover:bg-brand-50 text-foreground/90";
                            if (selected !== undefined) {
                                if (oi === mcq.answer)
                                    className = "border-green-300 bg-green-50 text-green-800";
                                else if (oi === selected)
                                    className = "border-red-300 bg-red-50 text-red-700";
                                else className = "border-border text-muted-foreground/80";
                            }
                            return (
                                <button
                                    key={`${mi}-${oi}`}
                                    onClick={() => handleMcqAnswer(mi, oi)}
                                    className={`w-full text-left text-[11px] font-body px-3 py-2 rounded-lg border transition-all ${className}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {mcqSelected[mi] !== undefined && (
                        <p className="text-[11px] font-body text-muted-foreground bg-accent rounded-lg p-2 mt-2">
                            {mcq.explanation}
                        </p>
                    )}
                </div>
            ))}

            {/* Short Answer */}
            <div className="bg-accent rounded-xl border border-border p-3">
                <p className="text-[10px] font-body font-medium text-muted-foreground/80 uppercase tracking-wider mb-1">
                    Short Answer
                </p>
                <p className="text-xs font-body text-foreground/90 leading-relaxed">
                    {content.shortAnswer.question}
                </p>
                <details className="mt-2">
                    <summary className="text-[10px] font-body text-brand-500 cursor-pointer hover:text-brand-600">
                        Show sample answer
                    </summary>
                    <p className="text-[11px] font-body text-muted-foreground mt-1 leading-relaxed">
                        {content.shortAnswer.sampleAnswer}
                    </p>
                </details>
            </div>

            {/* Regenerate */}
            <button
                onClick={generate}
                disabled={loading}
                className="text-[10px] font-body text-muted-foreground/80 hover:text-brand-500 transition-colors"
            >
                ↻ Generate new recall content
            </button>
        </div>
    );
}
