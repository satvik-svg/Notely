import { GoogleGenerativeAI } from "@google/generative-ai";

const PLACEHOLDER_KEYS = new Set(["AIzaSy...", "your-google-api-key", "your_api_key"]);

function normalizeKey(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";

  const hasDoubleQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const hasSingleQuotes = trimmed.startsWith("'") && trimmed.endsWith("'");
  if (hasDoubleQuotes || hasSingleQuotes) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function getGoogleApiKey(): string {
  return (
    normalizeKey(process.env.GOOGLE_API_KEY) ||
    normalizeKey(process.env.GEMINI_API_KEY) ||
    normalizeKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  );
}

export function hasUsableGoogleApiKey(): boolean {
  const key = getGoogleApiKey();
  if (!key) return false;
  if (PLACEHOLDER_KEYS.has(key)) return false;
  return key.startsWith("AIza") && key.length >= 35;
}

const genAI = new GoogleGenerativeAI(getGoogleApiKey() || "invalid-key");

// Flash model — free tier, fast
export const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Embedding model — for RAG
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
