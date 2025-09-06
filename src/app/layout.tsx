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
  title: "Nextjs Auth Template Created By BuddyCodez",
  description: "A template for Next.js applications with authentication",
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
