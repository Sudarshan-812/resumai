import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Existing Imports
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
// 2. IMPORT ANALYTICS HERE
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumAI - AI Resume Optimizer",
  description: "Optimize your resume with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          {/* Your Flaticon links or other head tags */}
      </head>
      <body className={inter.className}>
        
        {/* Progress Loader */}
        <NextTopLoader 
          color="#4f46e5" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} 
          easing="ease"
          speed={200}
          shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
        />

        {/* Page Content */}
        {children}

        {/* Global Notifications */}
        <Toaster />

        {/* 3. ADD ANALYTICS COMPONENT HERE */}
        <Analytics />
      </body>
    </html>
  );
}