import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/app/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumAI — AI Resume Optimizer",
  description: "Beat the ATS filter and land more interviews. ResumAI uses Gemini 2.5 Flash to score, rewrite, and optimize your resume against any job description.",
  metadataBase: new URL("https://resumai.in"),
  openGraph: {
    title: "ResumAI — AI Resume Optimizer",
    description: "Beat the ATS filter and land more interviews. Get your ATS score in 10 seconds.",
    url: "https://resumai.in",
    siteName: "ResumAI",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ResumAI" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumAI — AI Resume Optimizer",
    description: "Beat the ATS filter and land more interviews.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextTopLoader
            color="#4f46e5"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
          />
          {children}
          <Toaster richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
