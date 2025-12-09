import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import Footer from "@/app/components/landing/Footer";

export function LegalPage({ title, date, children }: { title: string, date: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-300 transition-colors duration-300">
      
      {/* Navbar */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">{title}</h1>
        <p className="text-sm text-zinc-500 mb-8">Last Updated: {date}</p>
        
        <div className="prose dark:prose-invert max-w-none prose-zinc prose-headings:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed">
          {children}
        </div>
      </main>
        <Footer />
    </div>
  );
}