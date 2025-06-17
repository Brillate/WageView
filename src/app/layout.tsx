import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Standard Next.js font import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable for Tailwind
});

export const metadata: Metadata = {
  title: 'RealTime WageView',
  description: 'Visualize your income in real time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Google Fonts links are kept as per guideline, even if Inter is also loaded via next/font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
