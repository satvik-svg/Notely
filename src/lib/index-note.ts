import { prisma } from "./prisma";
import { extractTextFromPDF, chunkText } from "./extract-text";
import { getEmbedding } from "./gemini";

export async function indexNote(noteId: string, fileUrl: string) {
  const text = await extractTextFromPDF(fileUrl);
  const chunks = chunkText(text, 800, 100);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);

    // Store chunk + embedding
    const record = await prisma.noteEmbedding.create({
      data: {
        noteId,
        chunk: chunks[i],
        chunkIndex: i,
        embedding: JSON.stringify(embedding), // fallback storage
      },
    });

    // Store as real pgvector column using raw SQL
    await prisma.$executeRaw`
      UPDATE "NoteEmbedding"
      SET embedding_vec = ${`[${embedding.join(",")}]`}::vector
      WHERE id = ${record.id}
    `;
  }
}
