import type { Metadata } from 'next';
import { Outfit } from 'next/font/google'; // Importing the new font
import './globals.css';

// Initialize the font
const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
  display: 'swap', 
});

export const metadata: Metadata = {
  title: 'ResumAI - Craft Perfect Resumes',
  description: 'AI-powered resume builder for developers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Add the font variable to the body */}
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}