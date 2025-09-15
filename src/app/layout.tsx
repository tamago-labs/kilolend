import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Bootstrap} from "@/components/Bootstrap/Bootstrap";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/components/Query/QueryClient.hooks";
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
  title: "KiloLend | Mini Dapp",
  description: "KiloLend is a Line Mini Dapp lending protocol on Kaia Blockchain. Borrow a wide range of stablecoins using any crypto as collateral, guided by AI for seamless one-click deal execution.",
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
       <GoogleAnalytics gaId="G-QNBVXZZR9E" />
    </html>
  );
}
