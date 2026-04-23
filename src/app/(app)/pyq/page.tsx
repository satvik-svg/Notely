"use client";
import { useState, useEffect } from "react";
import { FileText, Search, Calendar } from "lucide-react";
import { NoteCard } from "@/components/app/NoteCard";
import { NoteCardSkeleton } from "@/components/ui/Skeleton";

const SUBJECTS = ["All", "DBMS", "OS", "CN", "DSA", "Maths", "Physics", "Chemistry"];
const YEARS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const EXAM_TYPES = ["All", "Mid-Sem 1", "Mid-Sem 2", "End-Sem"];

export default function PYQPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const fetchPYQ = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ isPYQ: "true" });
        if (activeSubject !== "All") params.set("subject", activeSubject);
        if (activeYear !== "All") params.set("examYear", activeYear);
        if (debouncedQuery) params.set("q", debouncedQuery);

        const res = await fetch(`/api/notes?${params.toString()}`);
        const data = await res.json();
        setNotes(data.notes || []);
      } catch {
        console.error("Failed to fetch PYQs");
      } finally {
        setLoading(false);
      }
    };
    fetchPYQ();
  }, [activeSubject, activeYear, debouncedQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={24} className="text-brand-500" />
            <h1 className="font-display font-bold text-3xl text-slate-900">PYQ Papers</h1>
          </div>
          <p className="text-slate-500 font-body text-sm">Previous year question papers — your best exam prep resource.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search PYQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 shadow-sm transition-all w-full md:w-64 text-sm font-body"
          />
        </div>
      </div>

      {/* Year filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-500" />
          <span className="text-xs font-display font-semibold text-slate-600 uppercase tracking-wider">Year</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setActiveYear(y)}
              className={`text-[11px] font-body font-medium px-4 py-2 rounded-xl transition-all ${activeYear === y ? "bg-brand-500 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300"}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`text-[11px] font-body font-medium px-4 py-2 rounded-xl transition-all ${activeSubject === s ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* PYQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <NoteCardSkeleton key={i} />)
        ) : notes.length > 0 ? (
          notes.map((note: any) => (
            <NoteCard key={note.id} {...note} />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <FileText size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-body">No PYQs found for this filter. Be the first to upload!</p>
          </div>
        )}
      </div>
    </div>
  );
}
