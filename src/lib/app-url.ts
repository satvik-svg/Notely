// Helper to get the base URL for invite links
export function getAppBaseUrl(): string {
  // In production, always use the deployed URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback to deployed URL
  return "https://notely-beige.vercel.app";
}
