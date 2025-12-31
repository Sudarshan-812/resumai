import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORT THIS
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner"; // Assuming you have this

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
        
        {/* 2. ADD THIS COMPONENT HERE */}
        <NextTopLoader 
          color="#4f46e5" /* Indigo-600 to match your theme */
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} /* False looks cleaner, set True if you want a spinner top-right */
          easing="ease"
          speed={200}
          shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
        />

        {children}
        <Toaster />
      </body>
    </html>
  );
}