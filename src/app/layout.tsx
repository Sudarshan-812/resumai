import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react"; // 👈 IMPORT ANALYTICS

const inter = Inter({ subsets: ["latin"] });

// 👇 UPDATED SEO METADATA
export const metadata: Metadata = {
  title: "ResumAI — AI Resume Builder for Indian Jobs | ATS Optimized",
  description: "Get a top 1% ATS score in seconds. Our AI analyzes your resume against job descriptions to help you get hired at FAANG and top startups.",
  openGraph: {
    title: "ResumAI — AI Resume Builder",
    description: "Get a top 1% ATS score. Built for Indian Developers.",
    url: "https://resumai-bay.vercel.app",
    siteName: "ResumAI",
    images: [
      {
        url: "/og-image.png", // Make sure to add an image named 'og-image.png' to your public folder!
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics /> {/* 👈 ENABLE ANALYTICS */}
      </body>
    </html>
  );
}