import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JLPT N1 Coach",
  description: "AI-powered JLPT N1 study app. 15 minutes a day to N1.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JLPT N1 Coach" },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-background text-foreground">
        <div className="flex flex-col md:flex-row h-full min-h-screen">
          <Navigation />
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="max-w-3xl mx-auto p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
