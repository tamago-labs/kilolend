import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/Layout/LayoutWrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/components/Query/QueryClient.hooks";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KiloLend | AI-Powered DeFi on LINE / KAIA",
  description:
    "KiloLend makes KAIA DeFi easy on LINE Mini App with an AI co-pilot that helps you earn yield, borrow assets, swap tokens, and loop — no complex steps required.",
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
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </QueryClientProvider>
        </StyledComponentsRegistry>
      </body>
      <GoogleAnalytics gaId="G-QNBVXZZR9E" />
    </html>
  );
}
