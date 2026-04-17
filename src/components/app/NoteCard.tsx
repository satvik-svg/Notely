"use client";
import { motion } from "framer-motion";
import { MessageCircle, ThumbsUp, Download, Tag } from "lucide-react";
import Link from "next/link";

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
}

export function NoteCard({ id, title, subject, author, tags, upvoteCount, _count, fileType, createdAt }: NoteCardProps) {
  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/notes/${id}/upvote`, { method: "POST" });
      if (res.ok) {
        toast.success("Upvoted! +5 karma to author");
      }
    } catch (err) {
      toast.error("Failed to upvote");
    }
  };


  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 
                 hover:shadow-float hover:border-slate-200 transition-all cursor-pointer"
    >
      <Link href={`/notes/${id}`} className="block">
        {/* File type indicator + subject */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-body text-slate-400 uppercase tracking-wider">
            {subject}
          </span>
          <span
            className={`text-xs font-body font-medium px-2 py-0.5 rounded-md
            ${fileType === "pdf" ? "bg-red-50 text-red-600" : 
              fileType === "image" ? "bg-purple-50 text-purple-600" : 
              "bg-slate-50 text-slate-600"}`}
          >
            {fileType.toUpperCase()}
          </span>
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
            <span
              key={tag}
              className="text-xs font-body text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Footer stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
        <button 
          onClick={handleUpvote}
          className="flex items-center gap-1.5 text-xs font-body text-slate-400 
                           hover:text-brand-500 transition-colors group">
          <ThumbsUp size={13} className="group-hover:scale-110 transition-transform" />
          {upvoteCount}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-body text-slate-400 
                           hover:text-brand-500 transition-colors">
          <MessageCircle size={13} />
          {_count.comments}
        </button>

        <button className="ml-auto text-xs font-body text-slate-400 hover:text-slate-600">
          <Download size={13} />
        </button>
      </div>
    </motion.div>
  );
}
