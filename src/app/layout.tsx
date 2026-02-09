import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/Layout/LayoutWrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/components/Query/QueryClient.hooks";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import { GoogleAnalytics } from '@next/third-parties/google'
import { WagmiProvider } from 'wagmi'
import { config } from '@/wagmi_config';

import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KiloLend | DeFi Lending on KAIA for LINE Users",
  description:
    "KiloLend brings DeFi lending on KAIA to LINE with an AI co-pilot that handles lending, borrowing, and swaps — no spreadsheets, no complex workflows.",
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
          <Providers>
            <LayoutWrapper>
              {children}
            </LayoutWrapper> 
          </Providers>
        </StyledComponentsRegistry>
      </body>
      <GoogleAnalytics gaId="G-QNBVXZZR9E" />
    </html>
  );
}
