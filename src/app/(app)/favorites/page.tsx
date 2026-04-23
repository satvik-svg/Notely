"use client";
import { useState, useEffect } from "react";
import { Star, Search } from "lucide-react";
import { NoteCard } from "@/components/app/NoteCard";
import { NoteCardSkeleton } from "@/components/ui/Skeleton";

export default function FavoritesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Star size={24} className="text-amber-500 fill-amber-500" />
          <h1 className="font-display font-bold text-3xl text-slate-900">My Saved Notes</h1>
        </div>
        <p className="text-slate-500 font-body text-sm">Notes you&apos;ve starred for quick access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <NoteCardSkeleton key={i} />)
        ) : notes.length > 0 ? (
          notes.map((note: any) => (
            <NoteCard key={note.id} {...note} />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <Star size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-body">No saved notes yet. Star a note from the Browse page to save it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
