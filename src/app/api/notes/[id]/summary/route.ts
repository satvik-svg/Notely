import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/extract-text";
import { prisma } from "@/lib/prisma";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

function hasUsableApiKey(): boolean {
  return !!process.env.GROQ_API_KEY;
}

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "invalid" });

function guessImageMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/png";
}

async function extractTextFromImage(fileUrl: string): Promise<string> {
  const imageRes = await fetch(fileUrl);
  if (!imageRes.ok) throw new Error("Failed to fetch image");

  const mimeType = imageRes.headers.get("content-type") || guessImageMimeType(fileUrl);
  const bytes = Buffer.from(await imageRes.arrayBuffer());
  
  // Use Groq's vision model
  const { text } = await generateText({
    model: groq("llama-3.2-11b-vision-preview"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract readable study text from this image. Return only plain text without markdown or commentary. If no text is readable, return an empty string." },
          { type: "image", image: bytes }
        ]
      }
    ]
  });

  return text.trim();
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

function buildFallbackSummary(note: { title: string; subject: string; tags: string[]; description: string | null }, text: string): string {
  const normalized = text.replaceAll(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const tldrParts = sentences.slice(0, 3);
  const tldr =
    tldrParts.length > 0
      ? tldrParts.join(" ")
      : `${note.title} covers ${note.subject} concepts with focus on ${note.tags.slice(0, 3).join(", ") || "core topics"}.`;

  const pointsFromText = sentences.slice(0, 5).map((s) => `- ${s}`);
  const pointsFromMeta = [
    `- Subject: ${note.subject}`,
    `- Title focus: ${note.title}`,
    `- Key tags: ${note.tags.length > 0 ? note.tags.join(", ") : "not specified"}`,
    `- Description: ${note.description ?? "not provided"}`,
    "- Review the original note content for precise formulas/definitions.",
  ];

  const points = (pointsFromText.length > 0 ? pointsFromText : pointsFromMeta).slice(0, 5);

  const formulaMatches = normalized.match(/[A-Za-z][A-Za-z0-9_\- ]{0,20}=\s*[^.,;\n]{1,40}/g) ?? [];
  const formulas = formulaMatches.slice(0, 3);
  const formulasBlock =
    formulas.length > 0
      ? formulas.map((f) => `- ${f}`).join("\n")
      : "- No explicit formulas detected in extracted content.\n- Refer to the original note for equations/definitions.";

  return `TL;DR:\n${tldr}\n\nKey Points:\n${points.join("\n")}\n\nFormulas / Definitions:\n${formulasBlock}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let canUseAi = hasUsableApiKey();
    let text = "";

    try {
      text = await extractNoteText(note, canUseAi);
    } catch (error) {
      console.error("Note text extraction failed, falling back", error);
      text = "";
    }

    const trimmed = text.slice(0, 8000);

    if (canUseAi && trimmed) {
      const prompt = `You are a study assistant. Given the following study notes, provide:
1. A 3-sentence TL;DR summary
2. 5 key concepts/points as bullet points
3. 2-3 important formulas or definitions if any

Notes:
${trimmed}

Respond in clean, student-friendly language. Be concise.`;

      try {
        const { text: summary } = await generateText({
          model: groq("llama-3.1-8b-instant"),
          prompt
        });
        return NextResponse.json({ summary, source: "ai" });
      } catch (error) {
        console.error("AI summary generation failed, falling back", error);
      }
    }

    const fallbackSummary = buildFallbackSummary(note, trimmed);
    return NextResponse.json({
      summary: fallbackSummary,
      source: "fallback",
      message: canUseAi
        ? "Showing fallback summary because AI generation is temporarily unavailable."
        : "Showing fallback summary because AI is not configured.",
    });
  } catch (error) {
    console.error("Summary generation failed", error);
    return NextResponse.json(
      { error: "Failed to generate summary for this note" },
      { status: 500 }
    );
  }
}
