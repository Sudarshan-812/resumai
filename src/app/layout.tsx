import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
// 👇 Import Vercel components
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumAI - AI Resume Builder",
  description: "Craft the perfect resume with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        {/* Navbar visible on ALL pages */}
        <Navbar />
        
        {/* Main Page Content */}
        <main>{children}</main>

        {/* 👇 Vercel Tracking Components */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}