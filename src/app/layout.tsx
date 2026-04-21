import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NoteShare",
  description: "Share notes, earn karma, study together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-body bg-surface-secondary dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#1e293b",
              border: "0.5px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              boxShadow: "0 8px 32px -4px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
