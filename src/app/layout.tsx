import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit } from "next/font/google";
import "./globals.css";
import "material-symbols/outlined.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/app/components/motion-provider";
import { IconProvider } from "@/app/components/icon-provider";
import { RouteLoader } from "@/components/ui/route-loader";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://column8.io";

export const metadata: Metadata = {
  title: "Viva - Resume Scoring + AI Mock Interviews",
  description:
    "Score your resume against any job in seconds, see exactly which keywords you're missing, then rehearse a spoken AI mock interview built from your resume and that job description.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Viva - Beat the ATS, then rehearse the interview",
    description:
      "Get your resume's match score in seconds, fix the keyword gaps, and practice out loud with an AI interviewer that has read your resume and the job.",
    url: SITE_URL,
    siteName: "Viva",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Viva" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viva - Beat the ATS, then rehearse the interview",
    description:
      "Resume match score in seconds, keyword gaps fixed, and a spoken AI mock interview built from your resume and the job.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <MotionProvider>
          <IconProvider>{children}</IconProvider>
          <Toaster richColors />
          <Analytics />
          {/* Rendered last: RouteLoader calls useSearchParams(), so its
              Suspense boundary renders its fallback on the server and real
              content on the client. Keeping it after {children} stops that
              server/client boundary difference from shifting React's useId
              sequence for the page (which caused a Radix id hydration
              mismatch in the landing navbar). It paints a fixed overlay,
              so DOM order is irrelevant to how it looks. */}
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
        </MotionProvider>
      </body>
    </html>
  );
}
