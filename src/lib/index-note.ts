export async function indexNote(noteId: string, fileUrl: string) {
  // Embedding extraction is disabled per user request.
  // The chatbot functions purely as a general study assistant based on note metadata.
  console.log(`Skipping indexing for note ${noteId} as embeddings are disabled.`);
  return;
}
