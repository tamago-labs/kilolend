import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Bootstrap} from "@/components/Bootstrap/Bootstrap";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/components/Query/QueryClient.hooks";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KiloLend",
  description: "Decentralized Lending Protocol on KAIA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ margin: 0, backgroundColor: '#f1f5f9' }}>
        <StyledComponentsRegistry>
          <QueryClientProvider client={queryClient}>
            <Bootstrap>
              {children}
            </Bootstrap>
          </QueryClientProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
