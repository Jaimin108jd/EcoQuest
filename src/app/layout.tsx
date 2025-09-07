import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { TRPCReactProvider } from "@/trpc/client";
import {
  SpacemanThemeProvider,
} from '@space-man/react-theme-animation'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanQuest – Gamifying Environmental Clean-Up",
  description:
    "A Next.js web app that motivates volunteers and organizers through gamification to join clean-up events, track impact, and earn rewards for eco-friendly actions.",
};
export const experimental_ppr = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <AuthProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >

              {children}
            </body>
          </html>
      </AuthProvider>
    </TRPCReactProvider>
  );
}
