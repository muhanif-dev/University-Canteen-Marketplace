import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { getSession } from "@/lib/auth";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "University Canteen Marketplace",
  description:
    "A university canteen marketplace and ordering platform for students, faculty, and canteen owners.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {session && (
          <header className="border-b bg-background">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
              <Link href="/marketplace" className="font-semibold tracking-tight">
                University Canteen Marketplace
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/notifications" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
                  Notifications
                </Link>
                <NotificationBell />
              </div>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
