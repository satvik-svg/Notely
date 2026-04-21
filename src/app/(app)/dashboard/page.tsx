"use client";

import { useSession } from "next-auth/react";
import { RevisionDuePanel } from "@/components/app/RevisionDuePanel";

export default function DashboardPage() {
    const { data: session } = useSession();

    const userName = session?.user?.name ?? "there";

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Welcome */}
            <div>
                <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100">
                    Welcome back, {userName} 👋
                </h1>
                <p className="text-slate-500 font-body text-sm mt-1 dark:text-slate-400">
                    Here&apos;s your study progress at a glance.
                </p>
            </div>

            {/* Revision Due Panel */}
            <RevisionDuePanel />
        </div>
    );
}
