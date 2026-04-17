"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { SmartTagInput } from "@/components/app/SmartTagInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("DBMS");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim() || tags.length === 0 || !selectedFile) {
      toast.error("Please add title, tags, and upload a file first");
      return;
    }

    setLoading(true);
    try {
      const fileForm = new FormData();
      fileForm.append("file", selectedFile);

      const fileRes = await fetch("/api/local-upload", {
        method: "POST",
        body: fileForm,
      });

      if (!fileRes.ok) {
        const uploadError = await fileRes.json().catch(() => null);
        throw new Error(uploadError?.error || "Failed to upload file");
      }

      const filePayload = await fileRes.json();

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          tags,
          fileUrl: filePayload.url,
          fileType: filePayload.fileType,
        }),
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        throw new Error(errorPayload?.error || "Failed to save note metadata");
      }

      toast.success("Notes uploaded! You earned 10 karma ⬆");
      router.push("/notes");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  let submitLabel = "Upload & Share";
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
               placeholder="e.g. Operating Systems Unit 1 Summary" 
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all"
             />
          </div>

          <div className="space-y-2">
            <label htmlFor="note-subject" className="text-sm font-display font-semibold text-slate-700">Subject</label>
            <select 
              id="note-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all"
            >
              {["DBMS", "OS", "CN", "DSA", "Maths", "Physics", "Chemistry"].map(s => (
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
              <label
                htmlFor="note-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center hover:border-brand-300"
              >
                <UploadCloud size={24} className="mb-2 text-slate-400" />
                <p className="text-sm font-body font-medium text-slate-700">Click to choose a file</p>
                <p className="text-xs font-body text-slate-400 mt-1">PDF, PNG, JPG, JPEG, WEBP, TXT up to 16MB</p>
              </label>

              <input
                id="note-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,text/plain,application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setUploadedFileName(file?.name ?? "");
                }}
              />

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
                  <span className="text-xs font-body">No file selected yet</span>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-500 text-white font-body font-medium px-4 py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

