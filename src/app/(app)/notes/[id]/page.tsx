import { NoteDiscussionChat } from "@/components/app/NoteDiscussionChat";
import { AISummaryPanel } from "@/components/app/AISummaryPanel";
import { MCQQuiz } from "@/components/app/MCQQuiz";
import { RAGChat } from "@/components/app/RAGChat";
import { NoteViewTracker } from "@/components/app/NoteViewTracker";
import { RecallCard } from "@/components/app/RecallCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      embeddings: { select: { id: true }, take: 1 },
    }
  });

  if (!note) notFound();

  const firstChunkId = note.embeddings[0]?.id ?? null;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Passive view tracking — invisible */}
      <NoteViewTracker noteId={id} />

      {/* Left: Note viewer — takes 2 columns */}
      <div className="lg:col-span-2 space-y-5">
        {/* Note header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-body text-slate-400 uppercase tracking-wider block mb-1">
                {note.subject}
              </span>
              <h1 className="font-display font-bold text-2xl text-slate-900">{note.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-body text-slate-400">
            <span>By {note.author.name}</span>
            <span>·</span>
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden" style={{ height: 600 }}>
          <iframe
            src={note.fileUrl}
            className="w-full h-full border-none"
            title={note.title}
          />
        </div>

        {/* Discussion chat */}
        <NoteDiscussionChat noteId={id} />
      </div>

      {/* Right sidebar: AI tools */}
      <div className="space-y-5">
        <AISummaryPanel noteId={id} />
        <RAGChat noteId={id} />
        <MCQQuiz noteId={id} />

        {/* Recall / Revise section */}
        {firstChunkId && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] bg-purple-50 text-purple-600 font-body font-medium px-2 py-0.5 rounded-md">
                RECALL
              </span>
              <h3 className="font-display font-semibold text-slate-800 text-sm">
                Active Recall
              </h3>
            </div>
            <p className="text-xs font-body text-slate-400 mb-3">
              Generate flashcards &amp; quizzes to strengthen memory.
            </p>
            <RecallCard noteChunkId={firstChunkId} noteId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

