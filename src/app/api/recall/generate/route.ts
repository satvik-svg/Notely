import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export interface RecallFlashcard {
    question: string;
    answer: string;
}

export interface RecallMCQ {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
}

export interface RecallShortAnswer {
    question: string;
    sampleAnswer: string;
}

export interface RecallContent {
    flashcard: RecallFlashcard;
    mcqs: RecallMCQ[];
    shortAnswer: RecallShortAnswer;
    source: "ai" | "fallback";
}

function hasUsableApiKey(): boolean {
  return !!process.env.GROQ_API_KEY;
}

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "invalid" });

function buildFallbackContent(chunkText: string): RecallContent {
    const preview = chunkText.slice(0, 80);
    return {
        flashcard: {
            question: `What are the key concepts discussed in the following excerpt?\n"${preview}..."`,
            answer:
                "Review the original note chunk to identify the main concepts, definitions, and relationships discussed.",
        },
        mcqs: [
            {
                question: "What is the best way to retain information from study notes?",
                options: [
                    "A) Active recall and spaced repetition",
                    "B) Reading once and moving on",
                    "C) Highlighting everything",
                    "D) Copying notes verbatim",
                ],
                answer: 0,
                explanation:
                    "Active recall combined with spaced repetition is proven to be the most effective study technique.",
            },
            {
                question: `Which topic does this note chunk primarily relate to?`,
                options: [
                    "A) The content in the excerpt above",
                    "B) Unrelated material",
                    "C) General knowledge",
                    "D) None of the above",
                ],
                answer: 0,
                explanation:
                    "The chunk directly relates to the topic discussed in the excerpt.",
            },
        ],
        shortAnswer: {
            question: `Summarize the key idea from this excerpt in your own words:\n"${preview}..."`,
            sampleAnswer:
                "You should explain the main concept, any definitions, and how they relate to the broader topic.",
        },
        source: "fallback",
    };
}

function parseRecallContent(raw: string, chunkText: string): RecallContent {
    const cleaned = raw.replaceAll("\`\`\`json", "").replaceAll("\`\`\`", "").trim();

    try {
        const parsed = JSON.parse(cleaned);
        // Validate structure
        if (parsed.flashcard && Array.isArray(parsed.mcqs) && parsed.shortAnswer) {
            return { ...parsed, source: "ai" as const };
        }
    } catch {
        // Try extracting JSON object
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            try {
                const extracted = cleaned.slice(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(extracted);
                if (parsed.flashcard) {
                    return { ...parsed, source: "ai" as const };
                }
            } catch {
                // fall through
            }
        }
    }

    return buildFallbackContent(chunkText);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const noteChunkId = body?.noteChunkId as string | undefined;

    if (!noteChunkId) {
        return NextResponse.json(
            { error: "noteChunkId is required" },
            { status: 400 }
        );
    }

    // Fetch chunk text
    const embedding = await prisma.noteEmbedding.findUnique({
        where: { id: noteChunkId },
        select: { chunk: true, noteId: true },
    });

    if (!embedding) {
        return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
    }

    const chunkText = embedding.chunk;

    // Try AI generation
    if (hasUsableApiKey() && chunkText.trim()) {
        const prompt = `You are an expert study assistant. Based on the following study note excerpt, generate recall practice material.

IMPORTANT: Respond with ONLY valid JSON, no markdown fences, no extra text. Use this exact format:
{
  "flashcard": { "question": "...", "answer": "..." },
  "mcqs": [
    { "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": 0, "explanation": "..." },
    { "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": 0, "explanation": "..." }
  ],
  "shortAnswer": { "question": "...", "sampleAnswer": "..." }
}

The "answer" field in MCQs is the 0-based index of the correct option.

Study note excerpt:
${chunkText.slice(0, 4000)}`;

        try {
            const { text: raw } = await generateText({
              model: groq("llama-3.1-8b-instant"),
              prompt
            });
            const content = parseRecallContent(raw, chunkText);
            return NextResponse.json(content);
        } catch (error) {
            console.error("AI recall generation failed, using fallback", error);
        }
    }

    return NextResponse.json(buildFallbackContent(chunkText));
}
