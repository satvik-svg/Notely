"use client";
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { NoteCard } from "@/components/app/NoteCard";
import { NoteCardSkeleton, EmptyNotes } from "@/components/ui/Skeleton";

const SUBJECTS = ["All", "DBMS", "OS", "CN", "DSA", "Maths", "Physics", "Chemistry"];

export default function NotesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const subjectParam = activeSubject === "All" ? "" : activeSubject;
        const res = await fetch(`/api/notes?q=${debouncedQuery}&subject=${subjectParam}`);
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [debouncedQuery, activeSubject]);

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Browse Notes</h1>
          <p className="text-muted-foreground font-body text-sm">Find the best study material from your peers</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search notes, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-2xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 shadow-sm dark:shadow-none transition-all w-full md:w-64 text-sm font-body"
          />
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`text-[11px] font-body font-medium px-4 py-2 rounded-xl transition-all ${activeSubject === s ? "bg-brand-500 text-white shadow-brand-200 shadow-md dark:shadow-none" : "bg-card text-muted-foreground border border-border hover:border-brand-300" }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <NoteCardSkeleton key={i} />)
        ) : notes.length > 0 ? (
          notes.map((note: any) => (
            <NoteCard key={note.id} {...note} />
          ))
        ) : (
          <EmptyNotes />
        )}
      </div>
    </div>
  );
}
