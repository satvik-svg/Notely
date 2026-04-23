import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY || "invalid" });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const title = searchParams.get("title") ?? "";

  // Get existing popular tags that match the query
  const notes = await prisma.note.findMany({
    select: { tags: true },
    take: 200,
  });

  // Flatten and count all tags
  const tagCount: Record<string, number> = {};
  for (const note of notes) {
    for (const tag of note.tags) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    }
  }

  // Filter by query and sort by popularity
  const matched = Object.entries(tagCount)
    .filter(([tag]) => tag.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // If note title is provided and not many matches, generate AI suggestions
  let aiTags: string[] = [];
  if (title && matched.length < 3) {
    const prompt = `Given this study note title: "${title}"
    
Suggest exactly 5 short, relevant tags for organizing this note. 
Return ONLY a JSON array of strings. Example: ["DBMS", "SQL", "Normalization", "Database", "Unit3"]
No markdown, no extra text.`;

    try {
      if (process.env.GROQ_API_KEY) {
        const { text: rawText } = await generateText({
          model: groq("llama-3.1-8b-instant"),
          prompt
        });
        const raw = rawText.replace(/\`\`\`json|\`\`\`/g, "").trim();
        aiTags = JSON.parse(raw);
      }
    } catch (err) {
      console.error("AI Tag Gen failed", err);
    }
  }

  const combined = [...new Set([...matched, ...aiTags])].slice(0, 8);
  return NextResponse.json({ tags: combined });
}
