"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function JoinByInvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    async function joinGroup() {
      try {
        const res = await fetch("/api/groups/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode: code }),
        });
        const data = await res.json();
        if (res.ok) {
          setGroupName(data.groupName || "the group");
          setStatus("success");
          toast.success(`Joined ${data.groupName}!`);
          setTimeout(() => router.push("/groups"), 2000);
        } else {
          setStatus("error");
          toast.error(data.error || "Failed to join group");
        }
      } catch {
        setStatus("error");
        toast.error("Something went wrong");
      }
    }
    if (code) joinGroup();
  }, [code, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-card rounded-2xl border border-border shadow-card p-10 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="animate-spin text-brand-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-foreground mb-2">Joining Group...</h2>
            <p className="font-body text-sm text-muted-foreground">Please wait while we add you to the group.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-foreground mb-2">You&apos;re In!</h2>
            <p className="font-body text-sm text-muted-foreground">Successfully joined <strong>{groupName}</strong>. Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={40} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-foreground mb-2">Invalid Invite</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">This invite link is expired or invalid.</p>
            <button onClick={() => router.push("/groups")} className="bg-brand-500 text-white font-body font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-all">
              Go to Groups
            </button>
          </>
        )}
      </div>
    </div>
  );
}
