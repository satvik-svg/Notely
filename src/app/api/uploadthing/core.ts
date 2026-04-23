import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  noteUploader: f({
    pdf: { maxFileSize: "16MB" },
    image: { maxFileSize: "8MB" },
    text: { maxFileSize: "4MB" },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !(session.user as any).id) throw new Error("Unauthorized");
      return { userId: (session.user as any).id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload by", metadata.userId, "—", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
