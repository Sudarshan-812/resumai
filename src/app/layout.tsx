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
  title: "Viva - Retrieval-grounded resume intelligence + voice AI interviews",
  description:
    "Score your resume against any job, then question it: a copilot that retrieves and cites your real lines instead of guessing, and a spoken AI interviewer briefed on the gaps your analysis found.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Viva - Grounded resume copilot + a voice AI interviewer briefed on your analysis",
    description:
      "Hybrid retrieval + re-ranking so the copilot coaches from your real resume, not a hallucination. Then a spoken mock interview that probes the gaps your ATS analysis found.",
    url: SITE_URL,
    siteName: "Viva",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Viva" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viva - Grounded resume copilot + voice AI interviews",
    description:
      "Retrieval-grounded, cited answers about your resume. Plus a spoken AI interviewer briefed on your ATS gaps.",
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
