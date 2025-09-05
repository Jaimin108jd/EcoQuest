import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
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
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
          </body>
        </html>
      </AuthProvider>
    </TRPCReactProvider>
  );
}
