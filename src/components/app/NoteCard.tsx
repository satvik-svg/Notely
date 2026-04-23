"use client";
import { motion } from "framer-motion";
import { MessageCircle, ThumbsUp, Download, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface NoteCardProps {
  id: string;
  title: string;
  subject: string;
  author: { name: string };
  tags: string[];
  upvoteCount: number;
  _count: { comments: number };
  fileType: string;
  createdAt: string;
  isPYQ?: boolean;
  examYear?: number;
  examType?: string;
}

export function NoteCard({ id, title, subject, author, tags, upvoteCount, _count, fileType, createdAt, isPYQ, examYear, examType }: NoteCardProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites/${id}`).then((r) => r.json()).then((d) => setFavorited(d.favorited)).catch(() => {});
  }, [id]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/notes/${id}/upvote`, { method: "POST" });
      if (res.ok) toast.success("Upvoted! +5 karma to author");
    } catch { toast.error("Failed to upvote"); }
  };

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
      toast.success(data.favorited ? "Saved to favorites ★" : "Removed from favorites");
    } catch { toast.error("Failed"); }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 hover:shadow-float hover:border-slate-200 transition-all cursor-pointer"
    >
      <Link href={`/notes/${id}`} className="block">
        {/* File type indicator + subject */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-body text-slate-400 uppercase tracking-wider">
            {subject}
          </span>
          <div className="flex items-center gap-1.5">
            {isPYQ && (
              <span className="text-[10px] font-body font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
                PYQ {examYear}
              </span>
            )}
            <span
              className={`text-xs font-body font-medium px-2 py-0.5 rounded-md ${fileType === "pdf" ? "bg-red-50 text-red-600" : fileType === "image" ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-600"}`}
            >
              {fileType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-slate-900 text-sm mb-1 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Uploader */}
        <p className="text-xs font-body text-slate-400 mb-3">by {author.name} · {new Date(createdAt).toLocaleDateString()}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs font-body text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Footer stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
        <button
          onClick={handleUpvote}
          className="flex items-center gap-1.5 text-xs font-body text-slate-400 hover:text-brand-500 transition-colors group">
          <ThumbsUp size={13} className="group-hover:scale-110 transition-transform" />
          {upvoteCount}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-body text-slate-400 hover:text-brand-500 transition-colors">
          <MessageCircle size={13} />
          {_count.comments}
        </button>
        <button
          onClick={handleStar}
          className={`ml-auto text-xs font-body transition-colors ${favorited ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}
          title={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <Star size={14} className={favorited ? "fill-amber-500" : ""} />
        </button>
      </div>
    </motion.div>
  );
}
