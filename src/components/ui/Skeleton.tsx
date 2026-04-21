import { BookOpen } from "lucide-react";
import Link from "next/link";

export function NoteCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 animate-pulse dark:bg-slate-900 dark:border-slate-800">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-slate-100 rounded w-16 dark:bg-slate-800" />
        <div className="h-3 bg-slate-100 rounded w-10 dark:bg-slate-800" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 dark:bg-slate-800" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3 dark:bg-slate-800" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-slate-100 rounded-lg w-16 dark:bg-slate-800" />
        <div className="h-5 bg-slate-100 rounded-lg w-12 dark:bg-slate-800" />
      </div>
      <div className="h-px bg-slate-50 mb-3 dark:bg-slate-800" />
      <div className="flex gap-4">
        <div className="h-3 bg-slate-100 rounded w-8 dark:bg-slate-800" />
        <div className="h-3 bg-slate-100 rounded w-16 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function EmptyNotes() {
  return (
    <div className="col-span-full text-center py-20">
      <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-slate-800">
        <BookOpen size={20} className="text-brand-400" />
      </div>
      <h3 className="font-display font-semibold text-slate-700 mb-1 dark:text-slate-300">No notes yet</h3>
      <p className="text-sm font-body text-slate-400 mb-4 dark:text-slate-500">Be the first to upload notes for this subject</p>
      <Link href="/notes/upload" className="text-sm font-body font-medium text-brand-500 hover:text-brand-600">
        Upload now →
      </Link>
    </div>
  );
}
