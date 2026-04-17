import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEmbedding } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { question, history = [] } = await req.json();
  const { id } = await params;

  // 1. Embed the user's question
  const queryEmbedding = await getEmbedding(question);

  // 2. Find top-5 similar chunks using cosine similarity in pgvector
  const relevant = await prisma.$queryRaw<Array<{ chunk: string; similarity: number }>>`
    SELECT chunk, 1 - (embedding_vec <=> ${`[${queryEmbedding.join(",")}]`}::vector) AS similarity
    FROM "NoteEmbedding"
    WHERE "noteId" = ${id}
    ORDER BY embedding_vec <=> ${`[${queryEmbedding.join(",")}]`}::vector
    LIMIT 5
  `;

  // 3. Build context from retrieved chunks
  const context = relevant.map((r) => r.chunk).join("\n\n---\n\n");

  // Fire-and-forget: track retrieved chunks as "chat_review"
  // Uses internal fetch to the track endpoint
  const origin = new URL(req.url).origin;
  for (const r of relevant) {
    if ((r as Record<string, unknown>).id) {
      fetch(`${origin}/api/recall/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({
          noteChunkId: (r as Record<string, unknown>).id,
          event: "chat_review",
        }),
      }).catch(() => { });
    }
  }

  // 4. Build system prompt
  const systemPrompt = `You are a helpful study assistant. Answer the student's question using ONLY the context from their notes below. If the answer isn't in the notes, say "I couldn't find that in these notes."

NOTES CONTEXT:
${context}

Be concise, clear, and student-friendly.`;

  // 5. Stream response from Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    systemInstruction: systemPrompt,
    history: history.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessageStream(question);

  // Return as a streaming text response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
