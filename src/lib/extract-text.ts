import { PDFParse } from "pdf-parse";



export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    throw new Error("Failed to fetch PDF file");
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const data = await parser.getText();
    return data.text?.trim() ?? "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}


// Split text into overlapping chunks for better RAG
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}
