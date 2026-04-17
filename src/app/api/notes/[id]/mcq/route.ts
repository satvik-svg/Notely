import { NextRequest, NextResponse } from "next/server";
import { flashModel, hasUsableGoogleApiKey } from "@/lib/gemini";
import { extractTextFromPDF } from "@/lib/extract-text";
import { prisma } from "@/lib/prisma";

export interface MCQ {
  question: string;
  options: string[];   // 4 options
  answer: number;      // index of correct option (0-3)
  explanation: string;
}

function guessImageMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/png";
}

function isApiKeyInvalidError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes("API_KEY_INVALID") || error.message.includes("API key not valid");
}

async function extractTextFromImage(fileUrl: string): Promise<string> {
  const imageRes = await fetch(fileUrl);
  if (!imageRes.ok) throw new Error("Failed to fetch image");

  const mimeType = imageRes.headers.get("content-type") || guessImageMimeType(fileUrl);
  const bytes = Buffer.from(await imageRes.arrayBuffer());
  const base64 = bytes.toString("base64");

  const result = await flashModel.generateContent([
    {
      text: "Extract readable study text from this image. Return only plain text. If no text is readable, return an empty string.",
    },
    {
      inlineData: {
        mimeType,
        data: base64,
      },
    },
  ]);

  return result.response.text().trim();
}

async function extractNoteText(
  note: { fileType: string; fileUrl: string; title: string; description: string | null },
  allowImageOcr: boolean
): Promise<string> {
  if (note.fileType === "pdf") {
    try {
      return await extractTextFromPDF(note.fileUrl);
    } catch {
      return "";
    }
  }

  if (note.fileType === "text") {
    const textRes = await fetch(note.fileUrl);
    if (!textRes.ok) throw new Error("Failed to fetch text note");
    return (await textRes.text()).trim();
  }

  if (note.fileType === "image") {
    if (!allowImageOcr) return "";
    return extractTextFromImage(note.fileUrl);
  }

  return `${note.title}\n\n${note.description ?? ""}`.trim();
}

function buildFallbackMcqs(
  note: { title: string; subject: string; tags: string[]; description: string | null },
  text: string,
  count: number
): MCQ[] {
  const tags = note.tags.length > 0 ? note.tags : [note.subject, "Concept", "Revision", "Practice"];
  const primary = tags[0] ?? note.subject;
  const secondary = tags[1] ?? "Core topic";
  const tertiary = tags[2] ?? "Important point";

  const base: MCQ[] = [
    {
      question: `Which subject does the note "${note.title}" primarily belong to?`,
      options: [note.subject, primary, secondary, tertiary],
      answer: 0,
      explanation: `The note metadata marks the subject as ${note.subject}.`,
    },
    {
      question: `Which tag is explicitly associated with this note?`,
      options: [primary, "RandomTopic", "UnrelatedTag", "GeneralKnowledge"],
      answer: 0,
      explanation: `The note includes ${primary} among its tags.`,
    },
    {
      question: `What is the best immediate next step after reading this note?`,
      options: [
        "Revise key points and solve practice questions",
        "Ignore examples and only memorize headings",
        "Skip revision and move to a different subject",
        "Rely only on one reading without review",
      ],
      answer: 0,
      explanation: "Active recall and practice improve retention and exam performance.",
    },
    {
      question: `What is the main focus suggested by the note title?`,
      options: [note.title, note.subject, secondary, tertiary],
      answer: 0,
      explanation: "The title directly expresses the note's primary focus.",
    },
    {
      question: `Which strategy helps verify understanding of this note's concepts?`,
      options: [
        "Explain concepts in your own words and test yourself",
        "Only re-read passively",
        "Memorize without context",
        "Avoid solving any problems",
      ],
      answer: 0,
      explanation: "Self-explanation and testing are effective for understanding.",
    },
  ];

  if (text.trim()) {
    const words = text
      .replaceAll(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 5)
      .slice(0, 3);

    if (words.length > 0) {
      base[1] = {
        question: "Which of the following terms appears in the note content?",
        options: [words[0], "photosynthesis", "neuron", "continental drift"],
        answer: 0,
        explanation: `${words[0]} was extracted from the note content.`,
      };
    }
  }

  return base.slice(0, Math.max(1, Math.min(count, 10)));
}

function parseMcqs(raw: string): MCQ[] {
  const cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();

  try {
    return JSON.parse(cleaned) as MCQ[];
  } catch {
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      const extracted = cleaned.slice(firstBracket, lastBracket + 1);
      return JSON.parse(extracted) as MCQ[];
    }
    throw new Error("Could not parse MCQ JSON from model response");
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let requestedCount = 5;
  let noteId = "";
  let usedAi = false;

  try {
    const payload = await req.json().catch(() => ({}));
    requestedCount = typeof payload.count === "number" ? payload.count : 5;

    const { id } = await params;
    noteId = id;
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let canUseAi = hasUsableGoogleApiKey();
    let text = "";

    try {
      text = await extractNoteText(note, canUseAi);
    } catch (error) {
      if (isApiKeyInvalidError(error)) {
        canUseAi = false;
      }
      console.error("Note text extraction failed, using fallback MCQs", error);
      text = "";
    }

    const trimmed = text.slice(0, 6000);

    if (canUseAi && trimmed) {
      usedAi = true;
      const prompt = `You are a quiz generator for students. Based on the following study notes, generate exactly ${requestedCount} multiple choice questions.

IMPORTANT: Respond with ONLY valid JSON, no markdown, no extra text. Use this exact format:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": 0,
    "explanation": "..."
  }
]

The "answer" field is the 0-based index of the correct option.

Notes:
${trimmed}`;

      try {
        const result = await flashModel.generateContent(prompt);
        const raw = result.response.text();

        const mcqs = parseMcqs(raw);
        const normalized = mcqs.filter((q) => q?.question && Array.isArray(q.options) && q.options.length === 4);

        if (normalized.length > 0) {
          return NextResponse.json({ mcqs: normalized, source: "ai" });
        }
      } catch (error) {
        if (isApiKeyInvalidError(error)) {
          canUseAi = false;
        }
        console.error("AI MCQ generation failed, using fallback", error);
      }
    }

    const fallback = buildFallbackMcqs(note, trimmed, requestedCount);
    return NextResponse.json({
      mcqs: fallback,
      source: "fallback",
      message: usedAi || canUseAi
        ? "Showing fallback MCQs because AI generation is temporarily unavailable."
        : "Showing fallback MCQs because AI is not configured.",
    });
  } catch (error) {
    console.error("MCQ generation failed", error);

    try {
      if (!noteId) {
        const { id } = await params;
        noteId = id;
      }

      const note = await prisma.note.findUnique({ where: { id: noteId } });
      if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const fallback = buildFallbackMcqs(note, "", requestedCount);
      return NextResponse.json({
        mcqs: fallback,
        source: "fallback",
        message: "Showing fallback MCQs because AI generation failed.",
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to generate MCQ quiz for this note" },
        { status: 500 }
      );
    }
  }
}
