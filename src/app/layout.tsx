import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "sonner"; // 👈 Toast Notification
import { Analytics } from "@vercel/analytics/react"; // 👈 Vercel Analytics

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ResumAI - AI Powered Resume Builder",
    template: "%s | ResumAI"
  },
  description: "Boost your ATS score and land your dream job with AI-powered resume analysis.",
  openGraph: {
    title: "ResumAI - AI Powered Resume Builder",
    description: "Get instant feedback on your resume using Gemini AI.",
    url: "https://resumai-bay.vercel.app",
    siteName: "ResumAI",
    images: [
      {
        url: "https://resumai-bay.vercel.app/og-image.png", // Make sure to add an image to public folder
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors /> {/* 👈 Toast Container */}
          <Analytics /> {/* 👈 Analytics Script */}
        </ThemeProvider>
      </body>
    </html>
  );
}