import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 👇 1. Import the Component
import Navbar from "@/app/components/landing/Navbar";
import SmoothScroll from "@/app/components/SmoothScroll";

// 👇 Vercel Analytics (Optional)
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      <body className={`${inter.className} bg-white text-black antialiased selection:bg-black selection:text-white`}>
        <SmoothScroll>
          
          {/* 👇 2. Add JUST the Navbar Component here */}
          <Navbar />
          
          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>

          <Analytics />
          <SpeedInsights />
        </SmoothScroll>
      </body>
    </html>
  );
}