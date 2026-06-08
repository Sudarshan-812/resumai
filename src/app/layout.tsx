import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/app/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Column8 — AI Resume Optimizer",
  description: "Beat the ATS filter and land more interviews. Column8 uses Gemini 2.5 Flash to score, rewrite, and optimize your resume against any job description.",
  metadataBase: new URL("https://column8.io"),
  openGraph: {
    title: "Column8 — AI Resume Optimizer",
    description: "Beat the ATS filter and land more interviews. Get your ATS score in 10 seconds.",
    url: "https://column8.io",
    siteName: "Column8",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Column8" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Column8 — AI Resume Optimizer",
    description: "Beat the ATS filter and land more interviews.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextTopLoader
            color="#06b6d4"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #06b6d4,0 0 5px #06b6d4"
          />
{children}
          <Toaster richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
