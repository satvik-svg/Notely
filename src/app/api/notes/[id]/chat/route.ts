import { NextRequest } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!question) {
      return new Response("Please enter a question.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const note = await prisma.note.findUnique({
      where: { id },
      select: { title: true, subject: true, description: true, tags: true },
    });

    if (!note) {
      return new Response("Note not found.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response("Groq API key is not configured.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const groq = createGroq({ apiKey });

    const systemPrompt = `You are a helpful study chatbot for doubts.
Answer the student's question clearly, step-by-step, and in simple language.

NOTE DETAILS:
Title: ${note.title}
Subject: ${note.subject}
Description: ${note.description ?? "No description"}
Tags: ${note.tags.length > 0 ? note.tags.join(", ") : "No tags"}

Rules:
- Stay focused on this note/topic.
- Keep responses concise and student-friendly.`;

    const formattedHistory = history
      .filter((m: any) => m && typeof m === "object" && (m.role === "user" || m.role === "model" || m.role === "assistant"))
      .map((m: any) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content || "",
      }));

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      messages: [
        ...formattedHistory,
        { role: "user", content: question }
      ]
    });

    // We must return a raw text stream because the frontend RAGChat.tsx manually decodes text chunks.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat route failed", error);
    return new Response(
      "Chatbot is temporarily unavailable. Please try again in a few seconds.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
