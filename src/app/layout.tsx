import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 Import the global Navbar component
import Navbar from "@/components/Navbar";

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
        {/* 👇 Navbar lives here now, visible on ALL pages */}
        <Navbar />
        
        {/* Main Page Content */}
        {children}
      </body>
    </html>
  );
}