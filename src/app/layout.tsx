import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/providers/SessionProvider";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Local Power - Solar + Battery Solutions | Get Your Free Quote",
  description: "Discover how much you can save with Local Power's solar panels and battery storage. Professional installation, government rebates, and complete energy solutions for your home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </SessionProvider>
      </body>
    </html>
  );
}
