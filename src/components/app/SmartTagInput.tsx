"use client";
import { useState, useRef } from "react";
import { X } from "lucide-react";

export function SmartTagInput({ tags, setTags, noteTitle = "" }: { tags: string[], setTags: (t: string[]) => void, noteTitle?: string }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);


  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    const res = await fetch(`/api/tags/suggest?q=${encodeURIComponent(q)}&title=${encodeURIComponent(noteTitle)}`);
    const data = await res.json();
    setSuggestions(data.tags);
    setShowDropdown(true);
  };

  const onType = (val: string) => {
    setInput(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags([...tags, clean]);
    }
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <div className="relative">
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs font-body bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-100 dark:bg-slate-800">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-brand-900">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {tags.length < 5 && (
        <input
          value={input}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
          }}
          placeholder="Add tags (max 5)..."
          className="w-full text-xs font-body bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200 outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-100 transition-all dark:bg-slate-800 dark:border-slate-700"
        />
      )}

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-float z-10 overflow-hidden dark:bg-slate-900 dark:border-slate-700">
          {suggestions.map((s) => (
            <button key={s} onClick={() => addTag(s)}
              className="w-full text-left text-xs font-body text-slate-700 px-3 py-2 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">#</span> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
