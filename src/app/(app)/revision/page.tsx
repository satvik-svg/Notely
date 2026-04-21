"use client";

import { RevisionDuePanel } from "@/components/app/RevisionDuePanel";

export default function RevisionPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100">
                    🧠 Revision
                </h1>
                <p className="text-slate-500 font-body text-sm mt-1 dark:text-slate-400">
                    Review concepts before you forget them. Powered by spaced repetition.
                </p>
            </div>

            <RevisionDuePanel />
        </div>
    );
}
