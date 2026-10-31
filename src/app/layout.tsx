/* eslint-disable @next/next/no-page-custom-font, @next/next/google-font-display */
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PLANZO Finance Suite — Subscription & Financial Operations',
  description: 'Autonomous subscription lifecycle management, recurring billing engine, and financial operations platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#080D18] text-[#dee2f2] antialiased selection:bg-[#38bdf8] selection:text-[#00354a]">
        {children}
      </body>
    </html>
  );
}
