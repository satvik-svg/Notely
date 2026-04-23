import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

// Global chatbot — not tied to any note
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!question) {
      return new Response("Please enter a message.", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response("AI chatbot is not configured.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const groq = createGroq({ apiKey });

    const systemPrompt = `You are NoteBot, a helpful AI study assistant on the NoteShare platform for KIET students.
You help students with:
- Explaining concepts across subjects (DBMS, OS, CN, DSA, Maths, Physics, Chemistry, etc.)
- Study tips and exam preparation strategies
- Answering doubts about topics
- Helping with assignments and projects

Rules:
- Be concise and student-friendly
- Use simple language with examples
- If asked about something non-academic, politely redirect to studies
- Be encouraging and supportive`;

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
    console.error("Global chatbot failed", error);
    return new Response(
      "Chatbot is temporarily unavailable. Please try again.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
