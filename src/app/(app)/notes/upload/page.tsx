"use client";
import { useState, Suspense } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { SmartTagInput } from "@/components/app/SmartTagInput";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

const SUBJECTS = ["DBMS", "OS", "CN", "DSA", "Maths", "Physics", "Chemistry"];
const EXAM_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const EXAM_TYPES = ["Mid-Sem 1", "Mid-Sem 2", "End-Sem"];

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId") || undefined;
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [tags, setTags] = useState<string[]>([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileType, setUploadedFileType] = useState<"pdf" | "image" | "text" | "">("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);

  // PYQ fields
  const [isPYQ, setIsPYQ] = useState(false);
  const [examYear, setExamYear] = useState(2025);
  const [examType, setExamType] = useState("End-Sem");

  const handleUpload = async () => {
    if (!title.trim() || tags.length === 0 || !uploadedFileUrl || !uploadedFileType) {
      toast.error("Please add title, tags, and upload a file first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          tags,
          fileUrl: uploadedFileUrl,
          fileType: uploadedFileType,
          ...(groupId ? { groupId } : {}),
          ...(isPYQ ? { isPYQ: true, examYear, examType } : {}),
        }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        throw new Error(errorPayload?.error || "Failed to save note metadata");
      }

      toast.success(isPYQ ? "PYQ uploaded! You earned 10 karma" : "Notes uploaded! You earned 10 karma");
      router.push(groupId ? `/groups/${groupId}` : isPYQ ? "/pyq" : "/notes");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  let submitLabel = isPYQ ? "Upload PYQ" : "Upload & Share";
  if (loading) submitLabel = "Uploading and saving...";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900">Upload Notes</h1>
        <p className="text-sm font-body text-slate-500">Share your material and earn karma!</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
          <div className="space-y-2">
             <label htmlFor="note-title" className="text-sm font-display font-semibold text-slate-700">Title</label>
             <input
               id="note-title"
               type="text"
               placeholder={isPYQ ? "e.g. DBMS End-Sem 2024 Question Paper" : "e.g. Operating Systems Unit 1 Summary"}
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all"
             />
          </div>

          {/* PYQ Toggle */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl px-4 py-3">
            <FileText size={18} className="text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-display font-semibold text-amber-800">Previous Year Question Paper?</p>
              <p className="text-xs font-body text-amber-600/80">Mark this if you&apos;re uploading a PYQ</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPYQ(!isPYQ)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isPYQ ? "bg-amber-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPYQ ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* PYQ fields (conditional) */}
          {isPYQ && (
            <div className="grid grid-cols-2 gap-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <div className="space-y-1.5">
                <label className="text-sm font-display font-semibold text-slate-700">Exam Year</label>
                <select value={examYear} onChange={(e) => setExamYear(parseInt(e.target.value))} className="w-full text-sm font-body bg-white rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all">
                  {EXAM_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-display font-semibold text-slate-700">Exam Type</label>
                <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full text-sm font-body bg-white rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all">
                  {EXAM_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="note-subject" className="text-sm font-display font-semibold text-slate-700">Subject</label>
            <select
              id="note-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all"
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-display font-semibold text-slate-700">Tags</p>
            <SmartTagInput tags={tags} setTags={setTags} noteTitle={title} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-display font-semibold text-slate-700">File</p>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">
                <UploadCloud size={24} className="mb-2 text-slate-400" />
                <p className="text-sm font-body font-medium text-slate-700">Upload to cloud storage</p>
                <p className="text-xs font-body text-slate-400 mt-1">PDF, images, text files. Max depends on type.</p>
                <div className="mt-3">
                  <UploadButton
                    endpoint="noteUploader"
                    onClientUploadComplete={(res) => {
                      const first = res?.[0];
                      if (!first) {
                        toast.error("Upload failed. Please try again.");
                        return;
                      }

                      setUploadedFileUrl(first.url);
                      const lowerName = first.name.toLowerCase();
                      const inferredType =
                        lowerName.endsWith(".pdf")
                          ? "pdf"
                          : lowerName.endsWith(".txt")
                            ? "text"
                            : "image";

                      setUploadedFileType(inferredType);
                      setUploadedFileName(first.name);
                      toast.success("File uploaded to cloud");
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(error.message || "Upload failed");
                    }}
                  />
                </div>
              </div>

              {uploadedFileName && (
                <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
                  <p className="text-xs font-body text-brand-700">
                    Uploaded: {uploadedFileName}
                  </p>
                </div>
              )}

              {!uploadedFileName && (
                <div className="mt-3 flex items-center justify-center text-slate-400">
                  <UploadCloud size={16} className="mr-2" />
                  <span className="text-xs font-body">No file uploaded yet</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-body font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-50 ${isPYQ ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-brand-500 text-white hover:bg-brand-600"}`}
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto"><div className="h-96 bg-white rounded-2xl border border-slate-100 shadow-card animate-pulse" /></div>}>
      <UploadPageContent />
    </Suspense>
  );
}
