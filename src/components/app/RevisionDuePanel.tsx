"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Brain, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface RevisionItem {
    id: string;
    noteChunkId: string;
    noteId: string | null;
    noteTitle: string;
    noteSubject: string;
    chunkPreview: string;
    strengthScore: number;
    priority: "critical" | "due" | "strong";
    lastReviewedAt: string;
}

interface DueResponse {
    total: number;
    critical: RevisionItem[];
    due: RevisionItem[];
    strong: RevisionItem[];
}

function PriorityBadge({ priority }: { priority: string }) {
    const config = {
        critical: {
            bg: "bg-red-50",
            text: "text-red-600",
            icon: AlertTriangle,
            label: "Critical",
        },
        due: {
            bg: "bg-amber-50",
            text: "text-amber-600",
            icon: Clock,
            label: "Due",
        },
        strong: {
            bg: "bg-green-50",
            text: "text-green-600",
            icon: CheckCircle,
            label: "Strong",
        },
    }[priority] ?? {
        bg: "bg-slate-50",
        text: "text-slate-500",
        icon: Clock,
        label: priority,
    };

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 text-[10px] font-body font-medium px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}
        >
            <Icon size={10} />
            {config.label}
        </span>
    );
}

function RevisionItemCard({ item }: { item: RevisionItem }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all dark:border-slate-800">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={item.priority} />
                    <span className="text-[10px] font-body text-slate-400 uppercase tracking-wider dark:text-slate-500">
                        {item.noteSubject}
                    </span>
                </div>
                <p className="text-xs font-display font-semibold text-slate-800 truncate dark:text-slate-200">
                    {item.noteTitle}
                </p>
                <p className="text-[11px] font-body text-slate-400 mt-0.5 line-clamp-2 dark:text-slate-500">
                    {item.chunkPreview}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <div
                            className={`h-full rounded-full transition-all ${item.strengthScore < 0.3 ? "bg-red-400" : item.strengthScore <= 0.5 ? "bg-amber-400" : "bg-green-400" }`}
                            style={{ width: `${Math.round(item.strengthScore * 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-body text-slate-400 dark:text-slate-500">
                        {Math.round(item.strengthScore * 100)}%
                    </span>
                </div>
            </div>
            {item.noteId && (
                <Link
                    href={`/notes/${item.noteId}`}
                    className="text-[10px] font-body font-medium text-brand-500 hover:text-brand-600 whitespace-nowrap mt-1"
                >
                    Revise →
                </Link>
            )}
        </div>
    );
}

export function RevisionDuePanel() {
    const { data: session } = useSession();
    const [data, setData] = useState<DueResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDueItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/recall/due");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!session?.user) return;
        fetchDueItems();
    }, [session, fetchDueItems]);

    if (!session?.user) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Brain size={14} className="text-purple-600" />
                </div>
                <div>
                    <h3 className="font-display font-semibold text-slate-800 text-sm dark:text-slate-200">
                        Revision Due
                    </h3>
                    <p className="text-[10px] font-body text-slate-400 dark:text-slate-500">
                        Spaced repetition tracker
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-slate-50 rounded-xl animate-pulse dark:bg-slate-800"
                        />
                    ))}
                </div>
            ) : !data || data.total === 0 ? (
                <div className="text-center py-6">
                    <Brain size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-body text-slate-400 dark:text-slate-500">
                        No revisions due right now.
                    </p>
                    <p className="text-[10px] font-body text-slate-300 mt-1">
                        Study some notes to start building memory!
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.critical.length > 0 && (
                        <div>
                            <p className="text-[10px] font-body font-medium text-red-500 uppercase tracking-wider mb-1.5">
                                🔴 Critical ({data.critical.length})
                            </p>
                            <div className="space-y-1.5">
                                {data.critical.map((item) => (
                                    <RevisionItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    )}

                    {data.due.length > 0 && (
                        <div className={data.critical.length > 0 ? "mt-3" : ""}>
                            <p className="text-[10px] font-body font-medium text-amber-500 uppercase tracking-wider mb-1.5">
                                🟡 Due Today ({data.due.length})
                            </p>
                            <div className="space-y-1.5">
                                {data.due.map((item) => (
                                    <RevisionItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    )}

                    {data.strong.length > 0 && (
                        <div
                            className={
                                data.critical.length > 0 || data.due.length > 0 ? "mt-3" : ""
                            }
                        >
                            <p className="text-[10px] font-body font-medium text-green-500 uppercase tracking-wider mb-1.5">
                                🟢 Strong ({data.strong.length})
                            </p>
                            <div className="space-y-1.5">
                                {data.strong.map((item) => (
                                    <RevisionItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
