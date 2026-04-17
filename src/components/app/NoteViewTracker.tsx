"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Invisible client component that fires a "passive_view" tracking event
 * when a note page is viewed. Debounced to max once per 5 minutes per note.
 */
export function NoteViewTracker({ noteId }: Readonly<{ noteId: string }>) {
    const { data: session } = useSession();
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        if (!session?.user) return;

        // Debounce: check sessionStorage for recent tracking
        const key = `note_view_tracked_${noteId}`;
        const lastTracked = sessionStorage.getItem(key);
        if (lastTracked) {
            const elapsed = Date.now() - Number(lastTracked);
            if (elapsed < 5 * 60 * 1000) return; // 5 minutes debounce
        }

        tracked.current = true;
        sessionStorage.setItem(key, String(Date.now()));

        // Fire-and-forget — non-blocking
        fetch("/api/recall/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId, event: "passive_view" }),
        }).catch(() => {
            // Silently ignore tracking failures
        });
    }, [noteId, session]);

    return null;
}
